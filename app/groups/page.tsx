'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MessageSquare, PlusCircle } from "lucide-react";
import type { Group } from "../generated/prisma";

export default function GroupsPage() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchGroups() {
            try {
                const response = await fetch('/api/groups');
                if (!response.ok) {
                    throw new Error("Failed to fetch groups.");
                }
                const data = await response.json();
                setGroups(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchGroups();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (error) {
        return <div className="text-red-500 p-8">Error: {error}</div>;
    }

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Your Groups</h1>
                <Button asChild>
                    <Link href="/groups/create">
                        <PlusCircle className="mr-2 h-4 w-4" /> Create New Group
                    </Link>
                </Button>
            </div>

            {groups.length === 0 ? (
                <p>You are not a member of any groups yet.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groups.map((group) => (
                        <Card key={group.id}>
                            <CardHeader>
                                <CardTitle>{group.name}</CardTitle>
                                <CardDescription>Created on: {new Date(group.createdAt).toLocaleDateString()}</CardDescription>
                            </CardHeader>
                            <CardFooter>
                                <Button asChild className="w-full">
                                    <Link href={`/chat/group/${group.id}`}>
                                        <MessageSquare className="mr-2 h-4 w-4" /> Open Chat
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}