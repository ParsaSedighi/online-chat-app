'use client';

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Group, Message, User } from '@/app/generated/prisma'
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import Link from 'next/link';
import { Settings } from 'lucide-react';

import { Input } from './ui/input';
import { Button } from './ui/button';
import { Form, FormControl, FormField, FormItem } from './ui/form';
import { SendHorizonal } from 'lucide-react';

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
    const [socket, setSocket] = useState<Socket | null>(null);
    const [messages, setMessages] = useState<MessageWithAuthor[]>(initialMessages);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { content: "" },
    });

    // Effect to scroll to the bottom of the chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Effect to initialize and clean up socket connection
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
                {messages.map((message) => (
                    <div key={message.id} className="flex items-start gap-3">
                        <div className="flex flex-col">
                            <span className="font-bold">{message.author.name}</span>
                            <div className="p-3 rounded-lg bg-muted">
                                <p>{message.content}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {new Date(message.createdAt).toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
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