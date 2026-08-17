import { PrismaClient } from "@prisma/client";

// Single shared Prisma client instance for the whole server.
const prisma = new PrismaClient();

export default prisma;
