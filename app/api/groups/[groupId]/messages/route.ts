// src/app/api/groups/[groupId]/messages/route.ts

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: Request,
    { params }: { params: { groupId: string } }
) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { groupId } = params;

        // Verify the user is a member of the group before giving them messages
        const member = await prisma.groupMember.findFirst({
            where: {
                groupId: groupId,
                userId: session.user.id
            }
        });

        if (!member) {
            return NextResponse.json({ error: "You are not a member of this group." }, { status: 403 });
        }

        // Fetch the last 50 messages for the group
        const messages = await prisma.message.findMany({
            where: { groupId },
            include: { author: true },
            orderBy: { createdAt: 'asc' },
            take: 50,
        });

        return NextResponse.json(messages);

    } catch (error) {
        return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
    }
}