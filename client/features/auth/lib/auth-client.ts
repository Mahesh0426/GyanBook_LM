import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();

// destructuring the 3 properties of auth client object
export const { signIn, signOut, useSession } = authClient;
