'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { User } from "@/app/generated/prisma";

interface AddMemberFormProps {
    groupId: string;
    potentialMembers: User[];
}

export function AddMemberForm({ groupId, potentialMembers }: AddMemberFormProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(""); // This will store the selected user's ID
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!value) {
            setError("Please select a user to add.");
            return;
        }
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/groups/${groupId}/members`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userIdToAdd: value }),
        });

        const data = await response.json();

        if (!response.ok) {
            setError(data.error || "Failed to add member.");
        } else {
            console.log("Member added successfully!");
            // Refresh the page to update the user list
            router.refresh();
            setValue("");
        }
        setLoading(false);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center space-x-2">
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-[300px] justify-between"
                        >
                            {value
                                ? potentialMembers.find((user) => user.id === value)?.email
                                : "Select a user..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                        <Command>
                            <CommandInput placeholder="Search for user..." />
                            <CommandEmpty>No user found.</CommandEmpty>
                            <CommandGroup>
                                {potentialMembers.map((user) => (
                                    <CommandItem
                                        key={user.id}
                                        value={user.email as string}
                                        onSelect={() => {
                                            setValue(user.id);
                                            setOpen(false);
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value === user.id ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {user.email}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </Command>
                    </PopoverContent>
                </Popover>

                <Button onClick={handleSubmit} disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Add Member
                </Button>
            </div>
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
        </div>
    );
}