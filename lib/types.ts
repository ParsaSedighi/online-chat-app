import { auth } from "./auth";

// This will include the user, role, and any other custom fields.
export type Session = typeof auth.$Infer.Session;