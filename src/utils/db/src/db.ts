import { FloatFilter, prisma, StringFilter } from "~/utils/prisma";
import { Data, Drop, Entities, Meta, orm } from "..";

export const DB = {
  app: (application: string) => ({
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
  }),
};
