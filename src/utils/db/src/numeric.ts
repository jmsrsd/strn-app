import { prisma } from "~/utils/prisma";
import { Data, DB, Meta } from "..";

const orm = prisma.strn_numeric;

export const Numeric = async (args: { application: string; domain: string; id: string; key: string }) => {
  const { application, domain, id, key } = args;
  const meta = await Meta(application, domain, id, key);
  return await orm.findFirst({ where: { attribute_id: meta.attribute.id } })
    ?? await orm.create({ data: { value: 0, attribute_id: meta.attribute.id } });
};

export const NumericAttribute = <TKey extends string>(
  key: TKey,
  args: { application: string; domain: string; id: string },
) => {
  const { application, domain, id } = args;
  const data = async (key: string, value: number | undefined) => {
    return await Data({ application, domain, id, key }).numeric(value);
  };
  const attribute = {
    drop: async () => await DB.app(application).from(domain).id(id).drop(key),
    get: async () => await data(key, undefined),
    set: async (value: number) => {
      await data(key, value);
    },
  };
  const result: { [k in TKey]?: typeof attribute } = {};
  result[key] = attribute;
  return result;
};
