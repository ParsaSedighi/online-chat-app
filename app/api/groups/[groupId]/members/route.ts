import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
    req: Request,
    { params }: { params: { groupId: string } }
) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { groupId } = params;
        const { userIdToAdd } = await req.json();

        if (!userIdToAdd) {
            return NextResponse.json({ error: "User ID to add is required." }, { status: 400 });
        }

        // Find the group and its owner
        const group = await prisma.group.findUnique({
            where: { id: groupId },
        });

        if (!group) {
            return NextResponse.json({ error: "Group not found." }, { status: 404 });
        }

        // Authorize the action: requester must be the group owner or a Super Admin
        const isOwner = group.ownerId === session.user.id;
        const isAdmin = session.user.role === "admin";

        if (!isOwner && !isAdmin) {
            return NextResponse.json({ error: "Forbidden: Only the group owner or an admin can add members." }, { status: 403 });
        }

        // Check if the user to be added already exists
        const userExists = await prisma.user.findUnique({ where: { id: userIdToAdd } });
        if (!userExists) {
            return NextResponse.json({ error: "User to add does not exist." }, { status: 404 });
        }

        // Check if the user is already a member
        const existingMember = await prisma.groupMember.findUnique({
            where: {
                userId_groupId: {
                    userId: userIdToAdd,
                    groupId: groupId,
                },
            },
        });

        if (existingMember) {
            return NextResponse.json({ error: "User is already a member of this group." }, { status: 409 });
        }

        // Add the user to the group by creating a new GroupMember record
        await prisma.groupMember.create({
            data: {
                groupId,
                userId: userIdToAdd,
            },
        });

        return NextResponse.json({ message: "User added successfully." }, { status: 200 });

    } catch (error) {
        console.error("Failed to add member:", error);
        return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
    }
}