import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Contact } from "../../shared/types";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
interface ContactListItemProps {
  contact: Contact;
  isSelected: boolean;
  onClick: () => void;
}
export function ContactListItem({ contact, isSelected, onClick }: ContactListItemProps) {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'flex items-center w-full p-3 space-x-4 rounded-lg text-left transition-colors duration-200',
        isSelected ?
        'bg-primary text-primary-foreground' :
        'hover:bg-accent hover:text-accent-foreground'
      )}
      whileTap={{ scale: 0.98 }}
      layout>

      <Avatar>
        <AvatarImage src={contact.avatarUrl} alt={contact.name} />
        <AvatarFallback>{contact.initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate">{contact.name}</p>
        <p className={cn(
          'text-sm truncate',
          isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'
        )}>
          {contact.phone}
        </p>
      </div>
    </motion.button>);

}