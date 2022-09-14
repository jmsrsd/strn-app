import App from "next/app";
import { FloatFilter, prisma, StringFilter } from "~/utils/prisma";

const test = async () => {
  await db("test").from("post").id("abc123").get("title").text();
  await db("test").from("post").id("abc123").get("created").numeric();
  await db("test").from("post").id("abc123").get("content").document();
  await db("test").from("post").id("abc123").get("image").file();

  await db("test").from("post").id("abc123").set("title").text("");
  await db("test").from("post").id("abc123").set("created").numeric(0);
  await db("test").from("post").id("abc123").set("content").document("");
  await db("test").from("post").id("abc123").set("image").file([]);

  await db("test").from("post").query().ids();
  await db("test").from("post").query({ skip: 24 }).ids();
  await db("test").from("post").query({ take: 42 }).ids();
  await db("test").from("post").query({ order: "asc" }).ids();
  await db("test").from("post").query({ order: "desc" }).ids();

  await db("test").from("post").query().count();
  await db("test").from("post").query({ skip: 24 }).count();
  await db("test").from("post").query({ take: 42 }).count();
  await db("test").from("post").query({ order: "asc" }).count();
  await db("test").from("post").query({ order: "desc" }).count();

  await db("test").from("post").query().find("title").text("Foo");
  await db("test").from("post").query().find("title").text({ contains: "oo" });

  await db("test").from("post").query().find("created").numeric(123);
  await db("test").from("post").query().find("created").numeric({ gt: 122 });

  await db("test").from("post").query().find("content").document("Foo");
  await db("test").from("post").query().find("content").document({ contains: "oo" });
};

export const db = (application: string) => {
  return {
    from: (domain: string) => {
      return {
        query: (opts?: { skip?: number; take?: number; order?: "asc" | "desc" }) => {
          const Args = async () => {
            const { skip, take, order } = opts ?? {};
            const a = await Application(application);
            const d = await Domain(a.id, domain);
            const domain_id = d.id;
            return {
              orderBy: { id: order },
              skip,
              take,
              where: { domain_id },
            };
          };

          const orm = {
            entity: prisma.strn_entity,
            attribute: prisma.strn_attribute,
            text: prisma.strn_text,
            numeric: prisma.strn_numeric,
            document: prisma.strn_document,
            file: prisma.strn_file,
          };

          const count = async () => {
            const args = await Args();
            return await orm.entity.count({ ...args, select: { id: true } });
          };

          const ids = async () => {
            const args = await Args();
            const entities = await orm.entity.findMany({ ...args, select: { id: true } });
            return entities.map((entity) => entity.id);
          };

          const find = (key: string) => {
            return {
              text: async (where: StringFilter | string) => {
                const args = await Args();
                return await Entities({
                  domain: { id: args.where.domain_id },
                  attribute: await orm.text.findMany({
                    ...args,
                    select: { attribute_id: true },
                    where: { value: where },
                  }).then((values) => {
                    const ids = values.map((value) => value.attribute_id);
                    return { key, ids };
                  }),
                });
              },
              numeric: async (where: FloatFilter | number) => {
                const args = await Args();
                return await Entities({
                  domain: { id: args.where.domain_id },
                  attribute: await orm.numeric.findMany({
                    ...args,
                    select: { attribute_id: true },
                    where: { value: where },
                  }).then((values) => {
                    const ids = values.map((value) => value.attribute_id);
                    return { key, ids };
                  }),
                });
              },
              document: async (where: StringFilter | string) => {
                const args = await Args();
                return await Entities({
                  domain: { id: args.where.domain_id },
                  attribute: await orm.document.findMany({
                    ...args,
                    select: { attribute_id: true },
                    where: { value: where },
                  }).then((values) => {
                    const ids = values.map((value) => value.attribute_id);
                    return { key, ids };
                  }),
                });
              },
            };
          };
          return { find, count, ids };
        },
        id: (id: string) => {
          return {
            get: (key: string) => {
              const data = Data({ application, domain, id, key });
              return {
                text: async () => await data.text(),
                numeric: async () => await data.numeric(),
                document: async () => await data.document(),
                file: async () => await data.file(),
              };
            },
            set: (key: string) => {
              const data = Data({ application, domain, id, key });
              return {
                text: async (value: string) => await data.text(value),
                numeric: async (value: number) => await data.numeric(value),
                document: async (value: string) => await data.document(value),
                file: async (value: number[]) => await data.file(value),
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

export const Entities = async (args: { domain: { id: string }; attribute: { key: string; ids: string[] } }) => {
  const { domain, attribute } = args;

  const orm = {
    attribute: prisma.strn_attribute,
    entity: prisma.strn_entity,
  };

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
