import { prisma } from "~/utils/prisma";
import { Data, DB, Meta } from "..";

const orm = prisma.strn_document;

export const Document = async (args: { application: string; domain: string; id: string; key: string }) => {
  const { application, domain, id, key } = args;
  const meta = await Meta(application, domain, id, key);
  return await orm.findFirst({ where: { attribute_id: meta.attribute.id } })
    ?? await orm.create({ data: { value: "", attribute_id: meta.attribute.id } });
};

export const DocumentAttribute = <TKey extends string>(
  key: TKey,
  args: { application: string; domain: string; id: string },
) => {
  const { application, domain, id } = args;
  const data = async (key: string, value: string | undefined) => {
    return await Data({ application, domain, id, key }).document(value);
  };
  const attribute = {
    drop: async () => await DB.app(application).from(domain).id(id).drop(key),
    get: async () => await data(key, undefined),
    set: async (value: string) => {
      await data(key, value);
    },
  };
  const result: { [k in TKey]?: typeof attribute } = {};
  result[key] = attribute;
  return result;
};
