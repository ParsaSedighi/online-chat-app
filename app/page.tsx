import SignOut from "@/components/SignOut";
import { auth } from "@/lib/auth"; // path to your Better Auth server instance
import { headers } from "next/headers";
import Link from "next/link";


export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  return (
    <main>
      {session ? `logged in 👍: ${session.user.email}` : 'logged out 👎'}
      <div>
        {session ? <SignOut /> : <Link href={'/login'}>Login</Link>}
      </div>
    </main>
  );
}
