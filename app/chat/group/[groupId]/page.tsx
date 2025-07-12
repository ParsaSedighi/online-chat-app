import { ChatRoom } from "@/components/ChatRoom";
import { prisma } from "@/lib/prisma";

interface ChatPageProps {
    params: {
        groupId: string;
    };
}

export default async function ChatPage({ params }: ChatPageProps) {
    const { groupId } = await params;

    // Fetch initial data on the server
    const group = await prisma.group.findUnique({
        where: { id: groupId },
    });

    const initialMessages = await prisma.message.findMany({
        where: { groupId },
        include: { author: true },
        orderBy: { createdAt: 'asc' },
        take: 50,
    });

    if (!group) {
        return <div>Group not found.</div>;
    }

    return <ChatRoom group={group} initialMessages={initialMessages} />;
}