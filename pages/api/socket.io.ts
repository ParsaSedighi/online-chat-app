import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";
import { NextApiResponseServerIo } from "@/types/socket";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const config = {
    api: {
        bodyParser: false,
    },
};

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIo) => {
    if (!res.socket.server.io) {
        console.log("🚀 Initializing Socket.IO server...");
        const path = "/api/socket.io";
        const httpServer: NetServer = res.socket.server as any;
        const io = new ServerIO(httpServer, {
            path: path,
            addTrailingSlash: false,
        });

        // Authentication Middleware
        io.use(async (socket, next) => {
            try {
                // Adapt the socket's headers for the getSession method
                const headersObject = new Headers(socket.handshake.headers as HeadersInit);

                const session = await auth.api.getSession({
                    headers: headersObject,
                });

                if (!session || !session.user) {
                    return next(new Error("Authentication error: Invalid session."));
                }

                (socket as any).user = session.user;
                next();
            } catch (e) {
                next(new Error("Authentication error"));
            }
        });

        // Main Connection Handler
        io.on("connection", (socket) => {
            const user = (socket as any).user;
            console.log(`✅ User connected: ${user.email} (${socket.id})`);

            // Handler for joining a group room
            socket.on("join_group", async (groupId: string) => {
                const member = await prisma.groupMember.findFirst({
                    where: {
                        groupId: groupId,
                        userId: user.id
                    }
                });

                if (member) {
                    socket.join(groupId);
                    console.log(`🟢 User ${user.email} joined group: ${groupId}`);
                } else {
                    console.log(`🔴 User ${user.email} failed to join group: ${groupId} (not a member)`);
                }
            });

            // Handler for receiving and broadcasting a message
            socket.on("send_message", async (data) => {
                const { groupId, content } = data;
                if (!content || !groupId) return;

                try {
                    const message = await prisma.message.create({
                        data: {
                            content,
                            groupId,
                            authorId: user.id,
                        },
                        include: {
                            author: true,
                        },
                    });

                    // Broadcast the new message to all clients in the group room
                    io.to(groupId).emit("new_message", message);
                } catch (e) {
                    console.error("Error sending message:", e);
                }
            });

            // Handler for disconnection
            socket.on("disconnect", () => {
                console.log(`❌ User disconnected: ${user.email} (${socket.id})`);
            });
        });

        res.socket.server.io = io;
    }
    res.end();
};

export default ioHandler;