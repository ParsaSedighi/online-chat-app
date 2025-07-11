'use client'

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";

export default function SignOut() {
    const onClickHandler = async () => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    console.log('👍')
                    redirect('/')
                },
                onError: () => {
                    console.log('👎: SignOut error')
                }
            },
        });
    }

    return (
        <Button onClick={onClickHandler}>
            Sign Out
        </Button>
    )
}