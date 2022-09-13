import { prisma } from "~/utils/prisma";

const test = async () => {
  await db("test").from("post").id("abc123").text("title").query();
  await db("test").from("post").id("abc123").numeric("created").query();
  await db("test").from("post").id("abc123").document("content").query();
  await db("test").from("post").id("abc123").file("image").query();

  await db("test").from("post").id("abc123").text("title").mutate("");
  await db("test").from("post").id("abc123").numeric("created").mutate(0);
  await db("test").from("post").id("abc123").document("content").mutate("");
  await db("test").from("post").id("abc123").file("image").mutate([]);

  await db("test").from("post").ids();
  await db("test").from("post").ids({ skip: 24 });
  await db("test").from("post").ids({ take: 42 });
  await db("test").from("post").ids({ order: "asc" });
  await db("test").from("post").ids({ order: "desc" });

  await db("test").from("post").count();
  await db("test").from("post").count({ skip: 24 });
  await db("test").from("post").count({ take: 42 });
  await db("test").from("post").count({ order: "asc" });
  await db("test").from("post").count({ order: "desc" });
};

export const db = (application: string) => {
  return {
    from: (domain: string) => {
      return {
        count: async (args?: { skip?: number; take?: number; order?: "asc" | "desc" }) => {
          const { skip, take, order } = args ?? {};
          const a = await Application(application);
          const d = await Domain(a.id, domain);
          const domain_id = d.id;
          const orm = prisma.strn_entity;
          return await orm.count({
            select: { id: true },
            orderBy: { id: order },
            skip,
            take,
            where: { domain_id },
          });
        },
        ids: async (args?: { skip?: number; take?: number; order?: "asc" | "desc" }) => {
          const { skip, take, order } = args ?? {};
          const a = await Application(application);
          const d = await Domain(a.id, domain);
          const domain_id = d.id;
          const orm = prisma.strn_entity;
          return await orm.findMany({
            select: { id: true },
            orderBy: { id: order },
            skip,
            take,
            where: { domain_id },
          }).then((entities) => entities.map((entity) => entity.id));
        },
        id: (id: string) => {
          return {
            text: (key: string) => {
              const data = Data({ application, domain, id, key }).text;
              return {
                query: async () => await data(),
                mutate: async (value: string) => {
                  await data(value);
                },
              };
            },
            numeric: (key: string) => {
              const data = Data({ application, domain, id, key }).numeric;
              return {
                query: async () => await data(),
                mutate: async (value: number) => {
                  await data(value);
                },
              };
            },
            document: (key: string) => {
              const data = Data({ application, domain, id, key }).document;
              return {
                query: async () => await data(),
                mutate: async (value: string) => {
                  await data(value);
                },
              };
            },
            file: (key: string) => {
              const data = Data({ application, domain, id, key }).file;
              return {
                query: async () => await data(),
                mutate: async (value: number[]) => {
                  await data(value);
                },
              };
            },
          };
        },
      };
    },
  };
};

export const Application = async (key: string) => {
  const orm = prisma.strn_application;
  const data = { key };
  return await orm.findFirst({ where: data }) ?? await orm.create({ data });
};

export const Domain = async (application_id: string, key: string) => {
  const orm = prisma.strn_domain;
  const data = { key, application_id };
  return await orm.findFirst({ where: data }) ?? await orm.create({ data });
};

export const Entity = async (domain_id: string, id: string) => {
  const orm = prisma.strn_entity;
  const data = { id, domain_id };
  return await orm.findFirst({ where: data }) ?? await orm.create({ data });
};

export const Attribute = async (entity_id: string, key: string) => {
  const orm = prisma.strn_attribute;
  const data = { key, entity_id };
  return await orm.findFirst({ where: data }) ?? await orm.create({ data });
};

export const Text = async (args: { application: string; domain: string; id: string; key: string }) => {
  const application = await Application(args.application);
  const domain = await Domain(application.id, args.domain);
  const entity = await Entity(domain.id, args.id);
  const attribute = await Attribute(entity.id, args.key);
  const orm = prisma.strn_text;
  return await orm.findFirst({ where: { attribute_id: attribute.id } })
    ?? await orm.create({ data: { value: "", attribute_id: attribute.id } });
};

export const Numeric = async (args: { application: string; domain: string; id: string; key: string }) => {
  const application = await Application(args.application);
  const domain = await Domain(application.id, args.domain);
  const entity = await Entity(domain.id, args.id);
  const attribute = await Attribute(entity.id, args.key);
  const orm = prisma.strn_numeric;
  return await orm.findFirst({ where: { attribute_id: attribute.id } })
    ?? await orm.create({ data: { value: 0, attribute_id: attribute.id } });
};

export const Document = async (args: { application: string; domain: string; id: string; key: string }) => {
  const application = await Application(args.application);
  const domain = await Domain(application.id, args.domain);
  const entity = await Entity(domain.id, args.id);
  const attribute = await Attribute(entity.id, args.key);
  const orm = prisma.strn_document;
  return await orm.findFirst({ where: { attribute_id: attribute.id } })
    ?? await orm.create({ data: { value: "", attribute_id: attribute.id } });
};

export const File = async (args: { application: string; domain: string; id: string; key: string }) => {
  const application = await Application(args.application);
  const domain = await Domain(application.id, args.domain);
  const entity = await Entity(domain.id, args.id);
  const attribute = await Attribute(entity.id, args.key);
  const orm = prisma.strn_file;
  return await orm.findFirst({ where: { attribute_id: attribute.id } })
    ?? await orm.create({ data: { value: Buffer.from(Uint8Array.from([])), attribute_id: attribute.id } });
};

export const Data = (args: { application: string; domain: string; id: string; key: string }) => {
  const attribute = {
    id: async () => {
      const application = await Application(args.application);
      const domain = await Domain(application.id, args.domain);
      const entity = await Entity(domain.id, args.id);
      const attribute = await Attribute(entity.id, args.key);
      return attribute.id;
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

export const Meta = async (attribute_id: string) => {
  const attribute = await prisma.strn_attribute.findFirst({ where: { id: attribute_id } });
  const entity = await prisma.strn_entity.findFirst({ where: { id: attribute?.entity_id } });
  const domain = await prisma.strn_domain.findFirst({ where: { id: entity?.domain_id } });
  const application = await prisma.strn_application.findFirst({ where: { id: domain?.application_id } });
  return { application, domain, entity, attribute };
};
