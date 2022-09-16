import { prisma } from "~/utils/prisma";
import { orm } from "..";

export const Entity = async (domain_id: string, id: string) => {
  const data = { id, domain_id };
  const orm = prisma.strn_entity;
  return await orm.findFirst({ where: data }) ?? await orm.create({ data });
};

export const Entities = async (args: { domain: { id: string }; attribute: { key: string; ids: string[] } }) => {
  const { domain, attribute } = args;

  const attributes = await orm.attribute.findMany({
    select: { entity_id: true },
    where: {
      id: { in: attribute.ids },
      key: attribute.key,
    },
  });

  const entity_ids = attributes.map((attribute) => {
    return attribute.entity_id;
  });

  return await orm.entity.findMany({
    where: {
      id: { in: entity_ids },
      domain_id: domain.id,
    },
  });
};
