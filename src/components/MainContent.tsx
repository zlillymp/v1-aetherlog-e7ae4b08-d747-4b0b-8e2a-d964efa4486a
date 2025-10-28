import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { PhoneIncoming } from 'lucide-react';
import { useSelectedContact } from '@/lib/store';
import { FileUploadZone } from './FileUploadZone';
import { CallHistory } from './CallHistory';
import { Card, CardContent } from '@/components/ui/card';
const containerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: 'easeIn' } },
};
function WelcomeMessage() {
    return (
        <motion.div
            key="welcome"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="h-full flex flex-col items-center justify-center text-center"
        >
            <Card className="p-8 max-w-md">
                <CardContent className="p-0">
                    <PhoneIncoming className="h-16 w-16 mx-auto text-primary mb-6" />
                    <h2 className="text-2xl font-semibold mb-2">Welcome to AetherLog</h2>
                    <p className="text-muted-foreground">
                        Select a contact from the sidebar to view their call history, or upload new call recordings to get started.
                    </p>
                </CardContent>
            </Card>
        </motion.div>
    );
}
export function MainContent() {
  const selectedContact = useSelectedContact();
  return (
    <main className="flex-grow p-6 md:p-8 bg-muted/40 h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div layout>
          <FileUploadZone />
        </motion.div>
        <AnimatePresence mode="wait">
          {selectedContact ? (
            <motion.div
              key={selectedContact.id}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <CallHistory contact={selectedContact} />
            </motion.div>
          ) : (
            <WelcomeMessage />
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}