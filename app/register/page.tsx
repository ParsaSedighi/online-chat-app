// src/app/register/page.tsx

import { SignUpForm } from "@/components/SignUpForm";

export default function RegisterPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
            <SignUpForm />
        </main>
    );
}