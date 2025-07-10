
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";
import { admin } from "better-auth/plugins";
import { ac, roles } from "@/lib/permissions";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
    },
    plugins: [
        admin({
            adminUserIds: ["O5Oxh29e0pUWkWnNmR6PWNvubXrWoGWD"], // Temprory
            ac,
            roles
        })
    ]
    // socialProviders: {
    //     github: {
    //         clientId: process.env.GITHUB_CLIENT_ID as string,
    //         clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    //     },
    // },
});