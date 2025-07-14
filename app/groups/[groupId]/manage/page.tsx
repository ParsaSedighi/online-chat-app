import { prisma } from "@/lib/prisma";
import { AddMemberForm } from "@/components/AddMemberForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

interface ManageGroupPageProps {
    params: {
        groupId: string;
    };
}

export default async function ManageGroupPage({ params }: ManageGroupPageProps) {
    const { groupId } = await params;
    const session = await auth.api.getSession({ headers: await headers() });

    const group = await prisma.group.findUnique({
        where: { id: groupId },
        include: { members: true }
    });

    if (!group) {
        return <div>Group not found.</div>;
    }

    // Security check: Only owner or admin can see this page
    const isOwner = group.ownerId === session?.user.id;
    const isAdmin = session?.user.role === "admin";

    if (!isOwner && !isAdmin) {
        return <div>You are not authorized to manage this group.</div>;
    }

    // Get a list of all users who are NOT already members
    const existingMemberIds = group.members.map(member => member.userId);
    const potentialMembers = await prisma.user.findMany({
        where: {
            id: {
                notIn: existingMemberIds,
            },
        },
    });

    return (
        <main className="container mx-auto py-10">
            <Card>
                <CardHeader>
                    <CardTitle>Manage Group: {group.name}</CardTitle>
                    <CardDescription>Add new members to the group.</CardDescription>
                </CardHeader>
                <CardContent>
                    <AddMemberForm groupId={group.id} potentialMembers={potentialMembers} />
                </CardContent>
            </Card>
        </main>
    );
}