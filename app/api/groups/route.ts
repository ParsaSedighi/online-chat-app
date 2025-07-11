import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const groups = await prisma.group.findMany({
            where: {
                members: {
                    some: {
                        userId: session.user.id,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            }
        });

        return NextResponse.json(groups);

    } catch (error) {
        console.error("Failed to fetch groups:", error);
        return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
    }
}


export async function POST(request: Request) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session || !["admin", "GroupAdmin"].includes(session.user.role as string)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { name } = await request.json();
        if (!name || typeof name !== 'string' || name.length < 3) {
            return NextResponse.json({ error: "Invalid group name." }, { status: 400 });
        }

        const newGroup = await prisma.group.create({
            data: {
                name,
                ownerId: session.user.id,
                members: {
                    create: { userId: session.user.id }
                }
            }
        });

        return NextResponse.json(newGroup, { status: 201 });

    } catch (error) {
        console.error("Group creation error:", error);
        return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
    }
}