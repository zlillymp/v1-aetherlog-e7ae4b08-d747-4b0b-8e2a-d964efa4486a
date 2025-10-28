import { useMemo } from 'react';
import { create } from 'zustand';
import { api } from './api-client';
import type { Contact, CallRecord, User } from '@shared/types';
import type { ParsedFilenameData } from './utils';
interface AetherLogState {
  contacts: Contact[];
  callRecords: CallRecord[];
  adminUsers: User[];
  selectedContactId: string | null;
  searchTerm: string;
  isLoading: boolean;
  actions: {
    fetchContacts: () => Promise<void>;
    fetchCallRecords: (contactId?: string) => Promise<void>;
    selectContact: (contactId: string | null) => void;
    setSearchTerm: (term: string) => void;
    uploadCallRecord: (data: ParsedFilenameData) => Promise<{ contact: Contact; callRecord: CallRecord }>;
    fetchAdminUsers: () => Promise<void>;
    clearUserData: () => void;
    updateUserRole: (userId: string, role: 'admin' | 'user') => Promise<void>;
    deleteUser: (userId: string) => Promise<void>;
  };
}
export const useAetherLogStore = create<AetherLogState>((set, get) => ({
  contacts: [],
  callRecords: [],
  adminUsers: [],
  selectedContactId: null,
  searchTerm: '',
  isLoading: true,
  actions: {
    fetchContacts: async () => {
      try {
        set({ isLoading: true });
        const contacts = await api<Contact[]>(`/api/contacts`);
        set({ contacts });
      } catch (error) {
        console.error("Failed to fetch contacts:", error);
      } finally {
        set({ isLoading: false });
      }
    },
    fetchCallRecords: async (contactId?: string) => {
        if (!contactId) {
            set({ callRecords: [] });
            return;
        }
        try {
            const callRecords = await api<CallRecord[]>(`/api/contacts/${contactId}/calls`);
            set({ callRecords });
        } catch (error) {
            console.error(`Failed to fetch call records for contact ${contactId}:`, error);
            set({ callRecords: [] });
        }
    },
    selectContact: (contactId) => {
        set({ selectedContactId: contactId });
        get().actions.fetchCallRecords(contactId ?? undefined);
    },
    setSearchTerm: (term) => set({ searchTerm: term }),
    uploadCallRecord: async (data) => {
        const { contact, callRecord } = await api<{ contact: Contact; callRecord: CallRecord }>('/api/calls/upload', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        set((state) => {
            const contactExists = state.contacts.some((c) => c.id === contact.id);
            const updatedContacts = contactExists
                ? state.contacts.map((c) => (c.id === contact.id ? contact : c))
                : [...state.contacts, contact];
            const updatedCallRecords =
                state.selectedContactId === callRecord.contactId
                    ? [...state.callRecords, callRecord]
                    : state.callRecords;
            return {
                contacts: updatedContacts,
                callRecords: updatedCallRecords,
            };
        });
        return { contact, callRecord };
    },
    fetchAdminUsers: async () => {
      try {
        set({ isLoading: true });
        const users = await api<User[]>('/api/admin/users');
        set({ adminUsers: users });
      } catch (error) {
        console.error("Failed to fetch admin users:", error);
        set({ adminUsers: [] });
      } finally {
        set({ isLoading: false });
      }
    },
    clearUserData: () => {
      set({ contacts: [], callRecords: [], selectedContactId: null, searchTerm: '' });
    },
    updateUserRole: async (userId, role) => {
      const updatedUser = await api<User>('/api/admin/users/update-role', {
        method: 'POST',
        body: JSON.stringify({ userId, role }),
      });
      set((state) => ({
        adminUsers: state.adminUsers.map((user) =>
          user.id === userId ? { ...user, role: updatedUser.role } : user
        ),
      }));
    },
    deleteUser: async (userId) => {
      await api<{ id: string }>(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      set((state) => ({
        adminUsers: state.adminUsers.filter((user) => user.id !== userId),
      }));
    },
  },
}));
// Selectors
export const useContacts = () => useAetherLogStore((state) => state.contacts);
export const useSearchTerm = () => useAetherLogStore((state) => state.searchTerm);
export const useSelectedContactId = () => useAetherLogStore((state) => state.selectedContactId);
export const useAetherLogActions = () => useAetherLogStore((state) => state.actions);
export const useFilteredContacts = () => {
  const contacts = useContacts();
  const searchTerm = useSearchTerm();
  return useMemo(() => {
    if (!searchTerm) return contacts;
    return contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone.includes(searchTerm)
    );
  }, [contacts, searchTerm]);
};
export const useSelectedContact = () => {
  const contacts = useContacts();
  const selectedId = useSelectedContactId();
  return contacts.find((c) => c.id === selectedId) || null;
};
export const useSelectedContactCalls = () => {
  const allCalls = useAetherLogStore((state) => state.callRecords);
  const selectedId = useSelectedContactId();
  return useMemo(() => {
    if (!selectedId) return [];
    return allCalls
      .filter((call) => call.contactId === selectedId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [allCalls, selectedId]);
};