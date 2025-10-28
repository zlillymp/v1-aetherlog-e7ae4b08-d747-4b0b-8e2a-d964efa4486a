import React, { useEffect } from 'react';
import { ContactSidebar } from './ContactSidebar';
import { MainContent } from './MainContent';
import { Toaster } from '@/components/ui/sonner';
import { ThemeToggle } from './ThemeToggle';
import { useAetherLogActions } from '@/lib/store';
import { useAuthUser, useAuthActions } from '@/lib/auth';
export function AetherLogApp() {
  const { fetchContacts } = useAetherLogActions();
  const { initializeAuth } = useAuthActions();
  const user = useAuthUser();
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);
  useEffect(() => {
    if (user?.id) {
      fetchContacts();
    }
  }, [user?.id, fetchContacts]);
  return (
    <div className="h-screen w-screen bg-background text-foreground flex flex-col overflow-hidden">
      <ThemeToggle className="absolute top-4 right-4 z-50" />
      <div className="flex flex-grow min-h-0">
        <ContactSidebar />
        <MainContent />
      </div>
      <Toaster richColors position="top-right" />
    </div>
  );
}