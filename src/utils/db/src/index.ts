import { prisma } from "~/utils/prisma";
import { db, drop, orm } from "..";

export const Application = async (key: string) => {
  const data = { key };
  const orm = prisma.strn_application;
  return await orm.findFirst({ where: data }) ?? await orm.create({ data });
};

export const Domain = async (application_id: string, key: string) => {
  const data = { key, application_id };
  const orm = prisma.strn_domain;
  return await orm.findFirst({ where: data }) ?? await orm.create({ data });
};

export const Entity = async (domain_id: string, id: string) => {
  const data = { id, domain_id };
  const orm = prisma.strn_entity;
  return await orm.findFirst({ where: data }) ?? await orm.create({ data });
};

export const Entities = async (args: { domain: { id: string }; attribute: { key: string; ids: string[] } }) => {
  const { domain, attribute } = args;

  const entity_ids = await orm.attribute.findMany({
    select: { entity_id: true },
    where: {
      id: { in: attribute.ids },
      key: attribute.key,
    },
  }).then((result) => result.map((e) => e.entity_id));

  return await orm.entity.findMany({
    where: {
      id: { in: entity_ids },
      domain_id: domain.id,
    },
  });
};

export const Attribute = async (entity_id: string, key: string) => {
  const data = { key, entity_id };
  const orm = prisma.strn_attribute;
  return await orm.findFirst({ where: data }) ?? await orm.create({ data });
};

export const Text = async (args: { application: string; domain: string; id: string; key: string }) => {
  const { application, domain, id, key } = args;
  const meta = await Meta(application, domain, id, key);
  const orm = prisma.strn_text;
  return await orm.findFirst({ where: { attribute_id: meta.attribute.id } })
    ?? await orm.create({ data: { value: "", attribute_id: meta.attribute.id } });
};

export const Numeric = async (args: { application: string; domain: string; id: string; key: string }) => {
  const { application, domain, id, key } = args;
  const meta = await Meta(application, domain, id, key);
  const orm = prisma.strn_numeric;
  return await orm.findFirst({ where: { attribute_id: meta.attribute.id } })
    ?? await orm.create({ data: { value: 0, attribute_id: meta.attribute.id } });
};

export const Document = async (args: { application: string; domain: string; id: string; key: string }) => {
  const { application, domain, id, key } = args;
  const meta = await Meta(application, domain, id, key);
  const orm = prisma.strn_document;
  return await orm.findFirst({ where: { attribute_id: meta.attribute.id } })
    ?? await orm.create({ data: { value: "", attribute_id: meta.attribute.id } });
};

export const File = async (args: { application: string; domain: string; id: string; key: string }) => {
  const { application, domain, id, key } = args;
  const meta = await Meta(application, domain, id, key);
  const orm = prisma.strn_file;
  return await orm.findFirst({ where: { attribute_id: meta.attribute.id } })
    ?? await orm.create({ data: { value: Buffer.from(Uint8Array.from([])), attribute_id: meta.attribute.id } });
};

export const Data = (args: { application: string; domain: string; id: string; key: string }) => {
  const attribute = {
    id: async () => {
      const { application, domain, id, key } = args;
      const meta = await Meta(application, domain, id, key);
      return meta.attribute.id;
    },
  };
  return {
    text: async (value?: string) => {
      if (!value) return await Text(args);
      const orm = prisma.strn_text;
      const attribute_id = await attribute.id();
      const found = await orm.findFirst({ select: { id: true }, where: { attribute_id } });
      await orm.upsert({
        where: { id: found?.id },
        update: { value },
        create: { attribute_id, value },
      });
    },
    numeric: async (value?: number) => {
      if (!value) return await Numeric(args);
      const orm = prisma.strn_numeric;
      const attribute_id = await attribute.id();
      const found = await orm.findFirst({ select: { id: true }, where: { attribute_id } });
      await orm.upsert({
        where: { id: found?.id },
        update: { value },
        create: { attribute_id, value },
      });
    },
    document: async (value?: string) => {
      if (!value) return await Document(args);
      const orm = prisma.strn_document;
      const attribute_id = await attribute.id();
      const found = await orm.findFirst({ select: { id: true }, where: { attribute_id } });
      await orm.upsert({
        where: { id: found?.id },
        update: { value },
        create: { attribute_id, value },
      });
    },
    file: async (value?: number[]) => {
      if (!value) return await File(args);
      const orm = prisma.strn_file;
      const attribute_id = await attribute.id();
      const found = await orm.findFirst({ select: { id: true }, where: { attribute_id } });
      const buffer = Buffer.from(Uint8Array.from(value));
      await orm.upsert({
        where: { id: found?.id },
        update: { value: buffer },
        create: { attribute_id, value: buffer },
      });
    },
  };
};

export const Meta = async (application?: string, domain?: string, id?: string, key?: string) => {
  const a = await Application(`${application}`);
  const d = await Domain(a.id, `${domain}`);
  const e = await Entity(d.id, `${id}`);
  const attribute = await Attribute(e.id, `${key}`);
  return { application: a, domain: d, entity: e, attribute };
};

export const Drop = async (application?: string, domain?: string, id?: string, key?: string) => {
  const meta = await Meta(application, domain, id, key);

  if (!!key) {
    await drop.attribute(meta.attribute.id);
    return;
  }

  if (!!id) {
    await drop.attribute(meta.attribute.id);
    await drop.entity(meta.entity.id);
    return;
  }

  if (!!domain) {
    await drop.attribute(meta.attribute.id);
    await drop.entity(meta.entity.id);
    await drop.domain(meta.domain.id);
    return;
  }

  if (!!application) {
    await drop.attribute(meta.attribute.id);
    await drop.entity(meta.entity.id);
    await drop.domain(meta.domain.id);
    await drop.application(meta.application.id);
    return;
  }
};

const TextAttribute = <TKey extends string>(
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

const NumericAttribute = <TKey extends string>(
  key: TKey,
  args: { application: string; domain: string; id: string },
) => {
  const { application, domain, id } = args;
  const data = async (key: string, value: number | undefined) => {
    return await Data({ application, domain, id, key }).numeric(value);
  };
  const attribute = {
    drop: async () => await db(application).from(domain).id(id).drop(key),
    get: async () => await data(key, undefined),
    set: async (value: number) => {
      await data(key, value);
    },
  };
  const result: { [k in TKey]?: typeof attribute } = {};
  result[key] = attribute;
  return result;
};

const DocumentAttribute = <TKey extends string>(
  key: TKey,
  args: { application: string; domain: string; id: string },
) => {
  const { application, domain, id } = args;
  const data = async (key: string, value: string | undefined) => {
    return await Data({ application, domain, id, key }).document(value);
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

const FileAttribute = <TKey extends string>(
  key: TKey,
  args: { application: string; domain: string; id: string },
) => {
  const { application, domain, id } = args;
  const data = async (key: string, value: number[] | undefined) => {
    return await Data({ application, domain, id, key }).file(value);
  };
  const attribute = {
    drop: async () => await db(application).from(domain).id(id).drop(key),
    get: async () => await data(key, undefined),
    set: async (value: number[]) => {
      await data(key, value);
    },
  };
  const result: { [k in TKey]?: typeof attribute } = {};
  result[key] = attribute;
  return result;
};

export const ModelAttributes = (args: { application: string; domain: string; id: string }) => {
  return {
    text: <TKey extends string>(key: TKey) => TextAttribute<TKey>(key, args),
    numeric: <TKey extends string>(key: TKey) => NumericAttribute<TKey>(key, args),
    document: <TKey extends string>(key: TKey) => DocumentAttribute<TKey>(key, args),
    file: <TKey extends string>(key: TKey) => FileAttribute<TKey>(key, args),
  };
};

export const Model = <
  TApplication extends string,
  TDomain extends string,
  TAttributes,
  TOutput,
>(
  application: TApplication,
  domain: {
    key: TDomain;
    attributes: (
      attributes: TAttributes,
    ) => TOutput;
  },
  attributes: (args: { application: TApplication; domain: TDomain; id: string }) => TAttributes,
) => {
  const model = (application: TApplication, key: TDomain) => {
    return {
      id: (id: string) => domain.attributes(attributes({ application, domain: key, id })),
    };
  };

  return model(application, domain.key);
};
