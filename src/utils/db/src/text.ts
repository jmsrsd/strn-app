import { prisma } from "~/utils/prisma";
import { db } from "..";
import { Data, Meta } from ".";

const orm = prisma.strn_text;

export const Text = async (args: { application: string; domain: string; id: string; key: string }) => {
  const { application, domain, id, key } = args;
  const meta = await Meta(application, domain, id, key);
  return await orm.findFirst({ where: { attribute_id: meta.attribute.id } })
    ?? await orm.create({ data: { value: "", attribute_id: meta.attribute.id } });
};

export const TextAttribute = <TKey extends string>(
  key: TKey,
  args: { application: string; domain: string; id: string },
) => {
  const { application, domain, id } = args;
  const data = async (key: string, value: string | undefined) => {
    return await Data({ application, domain, id, key }).text(value);
  };
  const attribute = {
    drop: async () => await db(application).from(domain).id(id).drop(key),
    get: async () => await data(key, undefined),
    set: async (value: string) => {
      await data(key, value);
    },
  };
  const result: { [k in TKey]?: typeof attribute } = {};
  result[key] = attribute;
  return result;
};
