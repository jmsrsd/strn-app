import { prisma } from "~/utils/prisma";

export const Application = async (key: string) => {
  const data = { key };
  const orm = prisma.strn_application;
  return await orm.findFirst({ where: data }) ?? await orm.create({ data });
};
