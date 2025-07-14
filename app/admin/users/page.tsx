'use client';

import { Trash2 } from "lucide-react"; // Import trash icon
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { useEffect, useState, useCallback } from "react";
import { authClient } from "@/lib/auth-client";
import type { UserWithRole } from "better-auth/plugins";
import { Loader2, Pencil, PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CreateUserForm } from "@/components/CreateUserForm";

type SettableRole = "user" | "admin" | "GroupAdmin";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserWithRole[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State for the "Edit Role" dialog
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
    const [selectedRole, setSelectedRole] = useState<SettableRole>('user');
    const [isUpdating, setIsUpdating] = useState(false);

    // State for the "Create User" dialog
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);


    const handleDeleteUser = async (userId: string) => {
        const response = await fetch(`/api/users/${userId}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            console.log("User deleted successfully.");
            fetchUsers(); // Refresh the list
        } else {
            const data = await response.json();
            console.log(`Failed to delete user: ${data.error}`);
        }
    };

    const fetchUsers = useCallback(async () => {
        try {
            const response = await authClient.admin.listUsers({ query: { limit: 100 } });
            if (response.data) {
                setUsers(response.data.users);
            } else if (response.error) {
                throw new Error(response.error.message);
            }
        } catch (err: any) {
            setError(err.message || "Failed to fetch users.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleEditClick = (user: UserWithRole) => {
        setSelectedUser(user);
        setSelectedRole((user.role as SettableRole) || 'user');
        setIsEditDialogOpen(true);
    };

    const handleRoleChange = async () => {
        if (!selectedUser) return;
        setIsUpdating(true);
        setError(null);

        const { error } = await authClient.admin.setRole({
            userId: selectedUser.id,
            role: selectedRole as any,
        });

        if (error) {
            setError(error!.message!);
        } else {
            setIsEditDialogOpen(false);
            await fetchUsers();
        }
        setIsUpdating(false);
    };

    if (loading && users.length === 0) {
        return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="container mx-auto py-10">
            {/* Create User Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Create New User</DialogTitle>
                        <DialogDescription>
                            Fill out the form below to create a new user account.
                        </DialogDescription>
                    </DialogHeader>
                    <CreateUserForm
                        onSuccess={() => {
                            setIsCreateDialogOpen(false);
                            fetchUsers(); // Refresh the user list
                        }}
                    />
                </DialogContent>
            </Dialog>

            {/* Edit Role Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Role for {selectedUser?.name}</DialogTitle>
                        <DialogDescription>
                            Select a new role for this user. Click save when you're done.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="role-select" className="text-right">Role</Label>
                            <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as SettableRole)}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="user">User</SelectItem>
                                    <SelectItem value="admin">Admin (Super Admin)</SelectItem>
                                    <SelectItem value="GroupAdmin">Group Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {error && <p className="text-sm font-medium text-destructive col-span-4">{error}</p>}
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button onClick={handleRoleChange} disabled={isUpdating}>
                            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Main Content Card */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>User Management</CardTitle>
                        <CardDescription>View and manage all users in the system.</CardDescription>
                    </div>
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Create User
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableCaption>A list of all users in the system.</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.role}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="icon" className="mr-2" onClick={() => handleEditClick(user)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="icon">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the user
                                                        and all their associated data.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
                                                        Continue
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}