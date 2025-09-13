import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient();
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

// eslint-disable-next-line
const globalForPrisma = globalThis as unknown as {
  prismaClient: PrismaClientSingleton | undefined;
};

const prismaClient = globalForPrisma.prismaClient ?? prismaClientSingleton();

export default prismaClient;

if (process.env.NODE_ENV !== "production")
  globalForPrisma.prismaClient = prismaClient;
