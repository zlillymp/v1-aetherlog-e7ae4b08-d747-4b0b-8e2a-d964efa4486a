import React, { useEffect, useState } from 'react';
import { useAetherLogStore } from '@/lib/store';
import { useAuthUser } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { User, MoreHorizontal, Shield, Trash2, UserCog, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { User as UserType } from '@shared/types';
export function UserManagementTable() {
  const { adminUsers, isLoading, actions } = useAetherLogStore((state) => ({
    adminUsers: state.adminUsers,
    isLoading: state.isLoading,
    actions: state.actions,
  }));
  const currentUser = useAuthUser();
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserType | null>(null);
  useEffect(() => {
    actions.fetchAdminUsers();
  }, [actions]);
  const handleRoleChange = async (userId: string, role: 'admin' | 'user') => {
    setIsSubmitting(userId);
    const toastId = toast.loading(`Updating role for ${userId}...`);
    try {
      await actions.updateUserRole(userId, role);
      toast.success('User role updated successfully.', { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to update role.', { id: toastId });
    } finally {
      setIsSubmitting(null);
    }
  };
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setIsSubmitting(userToDelete.id);
    const toastId = toast.loading(`Deleting user ${userToDelete.email}...`);
    try {
      await actions.deleteUser(userToDelete.id);
      toast.success('User deleted successfully.', { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete user.', { id: toastId });
    } finally {
      setIsSubmitting(null);
      setUserToDelete(null);
    }
  };
  if (isLoading && adminUsers.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Registered Users</CardTitle></CardHeader>
        <CardContent><div className="space-y-2"><Skeleton className="h-10 w-full" /><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div></CardContent>
      </Card>
    );
  }
  return (
    <>
      <Card>
        <CardHeader><CardTitle>Registered Users</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adminUsers.length > 0 ? (
                adminUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell><Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>{user.role}</Badge></TableCell>
                    <TableCell className="text-right">
                      {isSubmitting === user.id ? (
                        <Loader2 className="h-4 w-4 animate-spin ml-auto" />
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0" disabled={user.id === currentUser?.id}>
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {user.role !== 'admin' && <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'admin')}><Shield className="mr-2 h-4 w-4" />Make Admin</DropdownMenuItem>}
                            {user.role !== 'user' && <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'user')}><UserCog className="mr-2 h-4 w-4" />Make User</DropdownMenuItem>}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive" onClick={() => setUserToDelete(user)}>
                              <Trash2 className="mr-2 h-4 w-4" />Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground"><User className="h-8 w-8 mb-2" /><span>No users found.</span></div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account for <span className="font-semibold">{userToDelete?.email}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Yes, delete user
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}