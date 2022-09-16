import { prisma } from "~/utils/prisma";

export const Attribute = async (entity_id: string, key: string) => {
  const data = { key, entity_id };
  const orm = prisma.strn_attribute;
  return await orm.findFirst({ where: data }) ?? await orm.create({ data });
};
