import { betterAuth } from "better-auth";
// This is the bridge between Better Auth and Prisma.
// Better Auth --> Prisma --> Adapter  --> Prisma Client  --> PostgreSQL
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./db.js"; // it will create |  Prisma Client -->PostgreSQL

// FE --> Express Routes --> Auth Logic  --> Db

const clientUrl = process.env.BETTER_AUTH_URL || `http://localhost:3001`;

// Create Authentication instance
export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [clientUrl],
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
});
