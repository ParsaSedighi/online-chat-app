import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
    req: Request,
    { params }: { params: { groupId: string } }
) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { groupId } = params;

        const group = await prisma.group.findUnique({
            where: { id: groupId },
        });

        if (!group) {
            return NextResponse.json({ error: "Group not found." }, { status: 404 });
        }

        // Authorize: Requester must be the group owner or a Super Admin
        const isOwner = group.ownerId === session.user.id;
        const isAdmin = session.user.role === "admin";

        if (!isOwner && !isAdmin) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Delete the group
        await prisma.group.delete({
            where: { id: groupId },
        });

        return NextResponse.json({ message: "Group deleted successfully." }, { status: 200 });

    } catch (error) {
        console.error("Failed to delete group:", error);
        return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
    }
}