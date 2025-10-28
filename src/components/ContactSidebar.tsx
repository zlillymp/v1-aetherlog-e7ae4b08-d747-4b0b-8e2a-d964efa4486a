import React from 'react';
import { Search, Users, LogOut, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ContactListItem } from './ContactListItem';
import { useFilteredContacts, useSelectedContactId, useAetherLogActions } from '@/lib/store';
import { useAuthActions, useAuthUser } from '@/lib/auth';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from './ui/button';
import { useNavigate, Link } from 'react-router-dom';
export function ContactSidebar() {
  const contacts = useFilteredContacts();
  const selectedContactId = useSelectedContactId();
  const { selectContact, setSearchTerm } = useAetherLogActions();
  const { logout } = useAuthActions();
  const user = useAuthUser();
  const navigate = useNavigate();
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return (
    <aside className="w-80 border-r bg-background flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AetherLog</h1>
          <p className="text-sm text-muted-foreground">Call Record Manager</p>
        </div>
        <div className="flex items-center gap-1">
          {user?.role === 'admin' && (
            <Button asChild variant="ghost" size="icon">
              <Link to="/admin" title="Admin Panel">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <span className="sr-only">Admin Panel</span>
              </Link>
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Log out">
            <LogOut className="h-5 w-5 text-muted-foreground" />
            <span className="sr-only">Log out</span>
          </Button>
        </div>
      </div>
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            className="pl-9"
            onChange={handleSearchChange}
          />
        </div>
      </div>
      <ScrollArea className="flex-grow">
        <div className="p-4 pt-0 space-y-2">
          <AnimatePresence>
            {contacts.map((contact) => (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <ContactListItem
                  contact={contact}
                  isSelected={contact.id === selectedContactId}
                  onClick={() => selectContact(contact.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
          {contacts.length === 0 && (
             <div className="text-center py-10 text-muted-foreground">
                <Users className="mx-auto h-8 w-8 mb-2" />
                <p className="text-sm">No contacts found.</p>
             </div>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}