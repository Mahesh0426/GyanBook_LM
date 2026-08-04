import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Store Prisma client globally to prevent creating multiple database connections
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Express API -> Prisma Client(English) ->  Adapter(Translator) ->  pg Pool((Spanish)) -> PostgreSQL DB

function createPrismaClient(): PrismaClient {
  //create a PostgreSQL DB connection pool to reads the db | manages reusable db connections
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  //Adapter acts as a bridge between Prisma and the PostgreSQL driver
  const adapter = new PrismaPg(pool);

  // Prisma Client-  Lets your app query the db
  return new PrismaClient({ adapter });
}
// Reuse existing Prisma client if it already exists. Otherwise, create a new Prisma client
const prisma = globalForPrisma.prisma ?? createPrismaClient();

// if application is running in dev mode, save the Prisma client on the globally avoid multiple Prisma instances.
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
