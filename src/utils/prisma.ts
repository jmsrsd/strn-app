import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default prisma;

export function makeSerializable(value: any) {
  return JSON.parse(JSON.stringify(value));
}
