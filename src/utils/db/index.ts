import { FloatFilter, prisma, StringFilter } from "~/utils/prisma";
import { Data, Drop, Entities, Meta } from "./src";

export * from "./src";

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

  await db("test").drop("post");
  await db("test").from("post").drop("abc123");
  await db("test").from("post").id("abc123").drop("title");
};

export const db = (application: string) => ({
  drop: async (domain: string) => {
    await Drop(application, domain);
  },
  from: (domain: string) => ({
    drop: async (id: string) => {
      await Drop(application, domain, id);
    },
    query: (opts?: { skip?: number; take?: number; order?: "asc" | "desc" }) => {
      const Args = async () => {
        const { skip, take, order } = opts ?? {};
        const meta = await Meta(application, domain);
        const domain_id = meta.domain.id;
        return {
          orderBy: { id: order },
          skip,
          take,
          where: { domain_id },
        };
      };

      const count = async () => {
        const args = await Args();
        const count = await orm.entity.count({ ...args, select: { id: true } });
        return count.id;
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
        drop: async (key: string) => {
          await Drop(application, domain, id, key);
        },
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
  }),
});

export const orm = {
  application: prisma.strn_application,
  domain: prisma.strn_domain,
  entity: prisma.strn_entity,
  attribute: prisma.strn_attribute,
  text: prisma.strn_text,
  numeric: prisma.strn_numeric,
  document: prisma.strn_document,
  file: prisma.strn_file,
};

export const drop = {
  application: async (application_id: string) => {
    await orm.domain.deleteMany({ where: { application_id } });
    await orm.application.deleteMany({ where: { id: application_id } });
  },
  domain: async (domain_id: string) => {
    await orm.entity.deleteMany({ where: { domain_id } });
    await orm.domain.deleteMany({ where: { id: domain_id } });
  },
  entity: async (entity_id: string) => {
    await orm.attribute.deleteMany({ where: { entity_id } });
    await orm.entity.deleteMany({ where: { id: entity_id } });
  },
  attribute: async (attribute_id: string) => {
    await orm.text.deleteMany({ where: { attribute_id } });
    await orm.numeric.deleteMany({ where: { attribute_id } });
    await orm.document.deleteMany({ where: { attribute_id } });
    await orm.file.deleteMany({ where: { attribute_id } });
    await orm.attribute.deleteMany({ where: { id: attribute_id } });
  },
};
