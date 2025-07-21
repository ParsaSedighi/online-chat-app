import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogoutButton } from './LogoutButton';
import type { Session } from '@/lib/types';
import { MessageSquare, Shield, Users } from 'lucide-react';

interface NavbarProps {
    session: Session | null;
}

export function Navbar({ session }: NavbarProps) {
    return (
        <header className="px-4 lg:px-6 h-14 flex items-center border-b bg-background sticky top-0 z-50">
            <Link href="/" className="flex items-center justify-center">
                <MessageSquare className="h-6 w-6" />
                <span className="sr-only">Real-Time Chat</span>
            </Link>
            <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
                {session ? (
                    <>
                        <Link
                            href="/groups"
                            className="text-sm font-medium hover:underline underline-offset-4"
                        >
                            <Users className="inline-block mr-1 h-4 w-4" /> Groups
                        </Link>

                        {/* Conditionally render the Admin link */}
                        {session.user.role === 'admin' && (
                            <Link
                                href="/admin/users"
                                className="text-sm font-medium hover:underline underline-offset-4"
                            >
                                <Shield className="inline-block mr-1 h-4 w-4" /> Admin
                            </Link>
                        )}

                        <LogoutButton />
                    </>
                ) : (
                    <>
                        <Button asChild variant="ghost">
                            <Link href="/login">Login</Link>
                        </Button>
                        <Button asChild>
                            <Link href="/register">Sign Up</Link>
                        </Button>
                    </>
                )}
            </nav>
        </header>
    );
}