import { z } from 'zod';
import { createRouter, withAuthResolver } from '~/server/router';
import { env } from '~/utils/env';

export const strndbRouter = createRouter()
  .merge(
    "entity.",
    createRouter()
      .query("browse", {
        input: z.object({
          document: z.string(),
          cursor: z.number().nullish(),
          take: z.number(),
          orderBy: z
            .object({
              createdAt: z.literal("asc").or(z.literal("desc")).optional(),
              updatedAt: z.literal("asc").or(z.literal("desc")).optional(),
            })
            .optional(),
        }),
        resolve: withAuthResolver(async ({ ctx, input }) => {
          const { document, cursor, take, orderBy } = input;
          const skip = cursor ?? 0;
          const where = { collection: env("APPLICATION_NAME"), document };
          const result = await ctx.prisma.strndb_entity.findMany({
            where,
            skip,
            take,
            orderBy,
          });
          const total = await ctx.prisma.strndb_entity.count({ where });
          const next = skip + take;
          return {
            result,
            skipped: skip < total ? take : total,
            taken: result.length,
            orderedBy: orderBy,
            total,
            next: next >= total ? undefined : next,
          };
        }),
      })
      .mutation("create", {
        input: z.object({
          document: z.string(),
        }),
        resolve: withAuthResolver(async ({ ctx, input }) => {
          return await ctx.prisma.strndb_entity.create({
            data: { ...input, collection: env("APPLICATION_NAME") },
          });
        }),
      })
      .mutation("remove", {
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
          const { document, value } = input;
          const entities = await ctx.prisma.strndb_entity.findMany({
            where: { collection: env("APPLICATION_NAME"), document },
          });
          const texts = await ctx.prisma.strndb_text.findMany({
            select: { entity: true },
            where: {
              entity: { in: entities.map((entity) => entity.id) },
              value,
            },
          });
          return entities
            .map((entity) => entity.id)
            .filter(texts.map((text) => text.entity).includes);
        }),
      })
      .query("get", {
        input: z.object({
          entity: z.string(),
          attribute: z.string(),
        }),
        resolve: withAuthResolver(async ({ ctx, input }) => {
          const { entity, attribute } = input;
          const _entity = await ctx.prisma.strndb_entity.findFirst({
            where: { id: entity },
          });
          if (!_entity) return undefined;

          const _text = await ctx.prisma.strndb_text.findFirst({
            where: input,
          });
          return _text ?? undefined;
        }),
      })
      .mutation("set", {
        input: z.object({
          entity: z.string(),
          attribute: z.string(),
          value: z.string(),
        }),
        resolve: withAuthResolver(async ({ ctx, input }) => {
          const { entity, attribute, value } = input;
          const _entity = await ctx.prisma.strndb_entity.findFirst({
            where: { id: entity },
          });
          if (!_entity) return undefined;

          const _text = await ctx.prisma.strndb_text.findFirst({
            select: { id: true },
            where: { entity, attribute },
          });
          const id = _text?.id;

          if (!!id) {
            await ctx.prisma.strndb_text.update({
              select: { id: true },
              where: { id },
              data: input,
            });
          } else {
            await ctx.prisma.strndb_text.create({
              select: { id: true },
              data: input,
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
          const { document, value } = input;
          const entities = await ctx.prisma.strndb_entity.findMany({
            where: { collection: env("APPLICATION_NAME"), document },
          });
          const numerics = await ctx.prisma.strndb_numeric.findMany({
            select: { entity: true },
            where: {
              entity: { in: entities.map((entity) => entity.id) },
              value,
            },
          });
          return entities
            .map((entity) => entity.id)
            .filter(numerics.map((numeric) => numeric.entity).includes);
        }),
      })
      .query("get", {
        input: z.object({
          entity: z.string(),
          attribute: z.string(),
        }),
        resolve: withAuthResolver(async ({ ctx, input }) => {
          const { entity, attribute } = input;

          const _entity = await ctx.prisma.strndb_entity.findFirst({
            where: { id: entity },
          });
          if (!_entity) return undefined;

          const _numeric = await ctx.prisma.strndb_numeric.findFirst({
            where: input,
          });
          return _numeric ?? undefined;
        }),
      })
      .mutation("set", {
        input: z.object({
          entity: z.string(),
          attribute: z.string(),
          value: z.number(),
        }),
        resolve: withAuthResolver(async ({ ctx, input }) => {
          const { entity, attribute } = input;

          const _entity = await ctx.prisma.strndb_entity.findFirst({
            where: { id: entity },
          });
          if (!_entity) return undefined;

          const _numeric = await ctx.prisma.strndb_numeric.findFirst({
            select: { id: true },
            where: { entity, attribute },
          });
          const id = _numeric?.id;

          if (!!id) {
            await ctx.prisma.strndb_numeric.update({
              select: { id: true },
              where: { id },
              data: input,
            });
          } else {
            await ctx.prisma.strndb_numeric.create({
              select: { id: true },
              data: input,
            });
          }
        }),
      })
  );
