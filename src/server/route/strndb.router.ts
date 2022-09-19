import { z } from 'zod';

import { createRouter, withAuthResolver } from '../router';

export const strndbRouter = createRouter()
  .merge(
    "entity.",
    createRouter()
      .query("browse", {
        input: z.object({
          collection: z.string(),
          document: z.string(),
          skip: z.number(),
          take: z.number(),
          orderBy: z
            .object({
              createdAt: z.literal("asc").or(z.literal("desc")).optional(),
              updatedAt: z.literal("asc").or(z.literal("desc")).optional(),
            })
            .optional(),
        }),
        resolve: withAuthResolver(async ({ ctx, input }) => {
          const { collection, document, skip, take, orderBy } = input;
          const result = await ctx.prisma.strndb_entity.findMany({
            where: { collection, document },
            skip,
            take,
            orderBy,
          });
          const total = await ctx.prisma.strndb_entity.count();
          const next = skip + take;
          return {
            result,
            skipped: skip < total ? skip : total,
            taken: result.length,
            orderedBy: orderBy,
            total,
            next: next > total ? undefined : next,
          };
        }),
      })
      .mutation("create", {
        input: z.object({
          collection: z.string(),
          document: z.string(),
        }),
        resolve: withAuthResolver(async ({ ctx, input }) => {
          return await ctx.prisma.strndb_entity.create({ data: input });
        }),
      })
      .mutation("delete", {
        input: z.object({
          id: z.string(),
        }),
        resolve: withAuthResolver(async ({ ctx, input }) => {
          const { id } = input;
          await Promise.all([
            ctx.prisma.strndb_entity.deleteMany({
              where: { id },
            }),
            ctx.prisma.strndb_text.deleteMany({
              where: { entity: id },
            }),
            ctx.prisma.strndb_numeric.deleteMany({
              where: { entity: id },
            }),
          ]);
        }),
      })
  )
  .merge(
    "text.",
    createRouter()
      .query("find", {
        input: z.object({
          collection: z.string(),
          document: z.string(),
          value: z
            .object({
              contains: z.string().optional(),
              endsWith: z.string().optional(),
              equals: z.string().optional(),
              gt: z.string().optional(),
              gte: z.string().optional(),
              in: z.string().or(z.array(z.string())).optional(),
              lt: z.string().optional(),
              lte: z.string().optional(),
              startsWith: z.string().optional(),
            })
            .or(z.string()),
        }),
        resolve: withAuthResolver(async ({ ctx, input }) => {
          const { collection, document, value } = input;
          const entities = await ctx.prisma.strndb_entity.findMany({
            where: { collection, document },
          });
          const entityIds = entities.map((entity) => entity.id);
          const texts = await ctx.prisma.strndb_text.findMany({
            select: { entity: true },
            where: { entity: { in: entityIds }, value },
          });
          const textEntityIds = texts.map((text) => text.entity);
          return entities.filter((entity) => textEntityIds.includes(entity.id));
        }),
      })
      .query("get", {
        input: z.object({
          entity: z.string(),
          key: z.string(),
        }),
        resolve: withAuthResolver(async ({ ctx, input }) => {
          const { entity, key } = input;
          const _entity = await ctx.prisma.strndb_entity.findFirst({
            where: { id: entity },
          });
          if (!_entity) return undefined;

          const _text = await ctx.prisma.strndb_text.findFirst({
            where: { entity, key },
          });
          return _text ?? undefined;
        }),
      })
      .mutation("set", {
        input: z.object({
          entity: z.string(),
          key: z.string(),
          value: z.string(),
        }),
        resolve: withAuthResolver(async ({ ctx, input }) => {
          const { entity, key, value } = input;
          const _entity = await ctx.prisma.strndb_entity.findFirst({
            where: { id: entity },
          });
          if (!_entity) return undefined;

          const _text = await ctx.prisma.strndb_text.findFirst({
            select: { id: true },
            where: { entity, key },
          });
          const id = _text?.id;

          if (!!id) {
            await ctx.prisma.strndb_text.update({
              select: {},
              where: { id },
              data: { entity, key, value },
            });
          } else {
            await ctx.prisma.strndb_text.create({
              select: {},
              data: { entity, key, value },
            });
          }
        }),
      })
  )
  .merge(
    "numeric.",
    createRouter()
      .query("find", {
        input: z.object({
          collection: z.string(),
          document: z.string(),
          value: z
            .object({
              equals: z.number().optional(),
              gt: z.number().optional(),
              gte: z.number().optional(),
              in: z.number().or(z.array(z.number())).optional(),
              lt: z.number().optional(),
              lte: z.number().optional(),
            })
            .or(z.number()),
        }),
        resolve: withAuthResolver(async ({ ctx, input }) => {
          const { collection, document, value } = input;
          const entities = await ctx.prisma.strndb_entity.findMany({
            where: { collection, document },
          });
          const entityIds = entities.map((entity) => entity.id);
          const numerics = await ctx.prisma.strndb_numeric.findMany({
            select: { entity: true },
            where: { entity: { in: entityIds }, value },
          });
          const numericEntityIds = numerics.map((numeric) => numeric.entity);
          return entities.filter((entity) =>
            numericEntityIds.includes(entity.id)
          );
        }),
      })
      .query("get", {
        input: z.object({
          entity: z.string(),
          key: z.string(),
        }),
        resolve: withAuthResolver(async ({ ctx, input }) => {
          const { entity, key } = input;
          const _entity = await ctx.prisma.strndb_entity.findFirst({
            where: { id: entity },
          });
          if (!_entity) return undefined;

          const _numeric = await ctx.prisma.strndb_numeric.findFirst({
            where: { entity, key },
          });
          return _numeric ?? undefined;
        }),
      })
      .mutation("set", {
        input: z.object({
          entity: z.string(),
          key: z.string(),
          value: z.number(),
        }),
        resolve: withAuthResolver(async ({ ctx, input }) => {
          const { entity, key, value } = input;
          const _entity = await ctx.prisma.strndb_entity.findFirst({
            where: { id: entity },
          });
          if (!_entity) return undefined;

          const _numeric = await ctx.prisma.strndb_numeric.findFirst({
            select: { id: true },
            where: { entity, key },
          });
          const id = _numeric?.id;

          if (!!id) {
            await ctx.prisma.strndb_numeric.update({
              select: {},
              where: { id },
              data: { entity, key, value },
            });
          } else {
            await ctx.prisma.strndb_numeric.create({
              select: {},
              data: { entity, key, value },
            });
          }
        }),
      })
  );
