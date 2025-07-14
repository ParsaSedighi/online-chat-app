import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
    req: Request,
    { params }: { params: { userId: string } }
) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (session?.user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { userId } = params;

        // Prevent an admin from deleting their own account
        if (userId === session.user.id) {
            return NextResponse.json({ error: "Cannot delete your own account." }, { status: 400 });
        }

        // Delete the user
        await prisma.user.delete({
            where: { id: userId },
        });

        return NextResponse.json({ message: "User deleted successfully." }, { status: 200 });

    } catch (error) {
        console.error("Failed to delete user:", error);
        return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
    }
}