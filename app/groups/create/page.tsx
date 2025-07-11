import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { CreateGroupForm } from "@/components/CreateGroupForm";

export default async function CreateGroupPage() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!["admin", "GroupAdmin"].includes(session?.user.role as string)) {
        return (
            <main className="flex min-h-screen flex-col items-center justify-center p-8">
                <h1 className="text-2xl font-bold">Unauthorized</h1>
                <p>You do not have permission to create groups.</p>
            </main>
        );
    }

    return <CreateGroupForm />;
}