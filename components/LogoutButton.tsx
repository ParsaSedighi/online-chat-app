'use client';

import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { Button } from './ui/button';
import { LogOut } from 'lucide-react';

export function LogoutButton() {
    const router = useRouter();

    const handleLogout = async () => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    // Redirect to the login page after signing out
                    router.push('/login');
                },
            },
        });
    };

    return (
        <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
        </Button>
    );
}