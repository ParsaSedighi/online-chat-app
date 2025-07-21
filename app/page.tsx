import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session) {
    redirect('/groups');
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] text-center px-4">
      <div className="space-y-4">
        <MessageSquare className="mx-auto h-16 w-16" />
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
          Welcome to Real-Time Chat
        </h1>
        <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
          Connect and collaborate instantly. Create groups, manage members, and chat in real-time with our secure and modern platform.
        </p>
        <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center">
          <Button asChild size="lg">
            <Link href="/register">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">Login</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}