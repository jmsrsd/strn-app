import { prisma } from "~/utils/prisma";

export const Domain = async (application_id: string, key: string) => {
  const data = { key, application_id };
  const orm = prisma.strn_domain;
  return await orm.findFirst({ where: data }) ?? await orm.create({ data });
};
