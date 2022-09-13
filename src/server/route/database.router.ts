import { z } from "zod";
import { createRouter, withRouteAuth } from "~/server/router";
import { Database } from "../database";
import { appKey } from "./app.router";

export const DatabaseWhereQuerySchema = z.object({
  where: z.object({
    domainKey: z.string(),
    entityId: z.string(),
    attributeKey: z.string(),
  }),
});

export const StringOrNumberSchema = z.string().or(z.number());

export const SetTypeSchema = z.literal("text").or(z.literal("numeric")).or(z.literal("document"));

export const databaseRouter = createRouter()
  .query("text", {
    input: DatabaseWhereQuerySchema,
    resolve: withRouteAuth(async ({ ctx, input }) => {
      return await new Database(ctx).text({
        where: {
          ...input.where,
          applicationKey: appKey,
        },
      });
    }),
  })
  .query("numeric", {
    input: DatabaseWhereQuerySchema,
    resolve: withRouteAuth(async ({ ctx, input }) => {
      return await new Database(ctx).numeric({
        where: {
          ...input.where,
          applicationKey: appKey,
        },
      });
    }),
  })
  .query("document", {
    input: DatabaseWhereQuerySchema,
    resolve: withRouteAuth(async ({ ctx, input }) => {
      return await new Database(ctx).document({
        where: {
          ...input.where,
          applicationKey: appKey,
        },
      });
    }),
  })
  .query("download", {
    input: DatabaseWhereQuerySchema,
    resolve: withRouteAuth(async ({ ctx, input }) => {
      return await new Database(ctx).download({
        where: {
          ...input.where,
          applicationKey: appKey,
        },
      });
    }),
  })
  .mutation("set", {
    input: z.object({
      type: SetTypeSchema,
      value: StringOrNumberSchema,
      query: DatabaseWhereQuerySchema,
    }),
    resolve: withRouteAuth(async ({ ctx, input }) => {
      const { type, value, query } = input;
      return await new Database(ctx).set(type, value, {
        where: {
          ...query.where,
          applicationKey: appKey,
        },
      });
    }),
  })
  .mutation("upload", {
    input: z.object({
      value: z.array(z.number()),
      query: DatabaseWhereQuerySchema,
    }),
    resolve: withRouteAuth(async ({ ctx, input }) => {
      const { value, query } = input;
      const buffer = Buffer.from(Uint8Array.from(value));
      return await new Database(ctx).upload(buffer, {
        where: {
          ...query.where,
          applicationKey: appKey,
        },
      });
    }),
  })
  .query("find", {
    input: z.object({
      mode: z.literal("first").or(z.literal("many")),
      domain: z.string(),
      type: SetTypeSchema,
      where: z.object({
        equals: StringOrNumberSchema.optional(),
        in: StringOrNumberSchema.or(z.array(StringOrNumberSchema)).optional(),
        notIn: StringOrNumberSchema.or(z.array(StringOrNumberSchema)).optional(),
        lt: StringOrNumberSchema.optional(),
        lte: StringOrNumberSchema.optional(),
        gt: StringOrNumberSchema.optional(),
        gte: StringOrNumberSchema.optional(),
        contains: z.string().optional(),
        startsWith: z.string().optional(),
        endsWith: z.string().optional(),
        not: z.number().optional(),
      }),
      take: z.number().optional(),
      skip: z.number().optional(),
    }),
    resolve: withRouteAuth(async ({ ctx, input }) => {
      const { mode, domain, type, where, take, skip } = input;
      return await new Database(ctx).find(
        { mode, application: appKey, domain, type, where, take, skip },
      );
    }),
  })
  .query("count", {
    input: z.object({
      domain: z.string(),
    }),
    resolve: withRouteAuth(async ({ ctx, input }) => {
      const { domain } = input;
      return await new Database(ctx).application(appKey).domain(domain).entities().then((entities) => {
        return entities.length;
      });
    }),
  })
  .query("browse", {
    input: z.object({
      domain: z.string(),
      skip: z.number().optional(),
      take: z.number().optional(),
    }),
    resolve: withRouteAuth(async ({ ctx, input }) => {
      const { domain, skip, take } = input;
      const entities = await new Database(ctx).application(appKey).domain(domain).entities().then((entities) => {
        return entities.map((entity) => entity.id);
      });
      const count = entities.length;
      const start = skip ?? 0;
      const end = start + (take ?? count);
      return entities.slice(start >= count ? count - 1 : start, end >= count ? count : end);
    }),
  });
