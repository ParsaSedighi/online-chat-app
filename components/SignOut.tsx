'use client'

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export default function SignOut() {
    const onClickHandler = async () => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    console.log('👍')
                },
                onError: () => {
                    console.log('👎:' + 'idiot')
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