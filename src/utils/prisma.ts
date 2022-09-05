import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export const serialize = (value: any) => {
  const stringified = JSON.stringify(value);
  const parsed = JSON.parse(stringified);
  return parsed;
};
