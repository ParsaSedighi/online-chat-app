'use client';

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Group, Message, User } from '@/app/generated/prisma';
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';

import { Input } from './ui/input';
import { Button } from './ui/button';
import { Form, FormControl, FormField, FormItem } from './ui/form';
import { SendHorizonal, Settings } from 'lucide-react';
import Link from 'next/link';

// A message type that includes the author object
type MessageWithAuthor = Message & { author: User };

interface ChatRoomProps {
    group: Group;
    initialMessages: MessageWithAuthor[];
}

const formSchema = z.object({
    content: z.string().min(1),
});

export function ChatRoom({ group, initialMessages }: ChatRoomProps) {
    // --- NEW: Get the current user's session ---
    const { data: session } = authClient.useSession();

    const [socket, setSocket] = useState<Socket | null>(null);
    const [messages, setMessages] = useState<MessageWithAuthor[]>(initialMessages);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { content: "" },
    });

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        const newSocket = io({
            path: '/api/socket.io',
        });

        newSocket.on('connect', () => {
            console.log('Connected to socket.io server!');
            newSocket.emit('join_group', group.id);
        });

        newSocket.on('new_message', (message: MessageWithAuthor) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [group.id]);

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        if (socket) {
            socket.emit('send_message', {
                groupId: group.id,
                content: values.content,
            });
            form.reset();
        }
    };

    return (
        <div className="flex flex-col h-screen">
            <header className="p-4 border-b bg-background sticky top-0 flex justify-between items-center">
                <h1 className="text-xl font-bold">{group.name}</h1>
                <Button variant="outline" size="icon" asChild>
                    <Link href={`/groups/${group.id}/manage`}>
                        <Settings className="h-4 w-4" />
                    </Link>
                </Button>
            </header>

            <main className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => {
                    // --- NEW: Check if the message is from the current user ---
                    const isOwnMessage = message.authorId === session?.user?.id;

                    return (
                        <div
                            key={message.id}
                            // --- NEW: Conditionally align the entire message container ---
                            className={cn("flex items-end gap-3", {
                                "justify-end": isOwnMessage,
                                "justify-start": !isOwnMessage,
                            })}
                        >
                            <div className="flex flex-col">
                                {/* --- NEW: Only show author's name if it's not your own message --- */}
                                {!isOwnMessage && (
                                    <span className="text-sm text-muted-foreground ml-3 mb-1">
                                        {message.author.name}
                                    </span>
                                )}
                                <div
                                    // --- NEW: Conditionally change the color of the message bubble ---
                                    className={cn("p-3 rounded-lg max-w-xs md:max-w-md", {
                                        "bg-primary text-primary-foreground": isOwnMessage,
                                        "bg-muted": !isOwnMessage,
                                    })}
                                >
                                    <p className="text-sm">{message.content}</p>
                                    <p className={cn("text-xs mt-1", {
                                        "text-primary-foreground/70": isOwnMessage,
                                        "text-muted-foreground": !isOwnMessage,
                                    })}>
                                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </main>

            <footer className="p-4 border-t bg-background sticky bottom-0">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-2">
                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormControl>
                                        <Input placeholder="Type a message..." {...field} autoComplete="off" />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <Button type="submit" size="icon" disabled={form.formState.isSubmitting}>
                            <SendHorizonal className="h-4 w-4" />
                        </Button>
                    </form>
                </Form>
            </footer>
        </div>
    );
}