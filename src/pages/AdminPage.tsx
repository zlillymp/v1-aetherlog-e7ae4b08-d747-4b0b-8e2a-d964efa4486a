import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserManagementTable } from '@/components/UserManagementTable';
export function AdminPage() {
  return (
    <div className="min-h-screen w-full bg-muted/40 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Shield className="h-10 w-10 text-primary" />
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
                <p className="text-muted-foreground">Manage user accounts, roles, and permissions.</p>
              </div>
            </div>
            <Button asChild variant="outline">
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to App
              </Link>
            </Button>
          </div>
        </header>
        <main>
          <UserManagementTable />
        </main>
        <footer className="text-center text-sm text-muted-foreground mt-12">
          <p>Built with ❤️ at Cloudflare</p>
        </footer>
      </div>
    </div>
  );
}