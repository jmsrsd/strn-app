import { z } from "zod";
import { createRouter, withAuthResolver } from "~/server/router";
import { DB } from "~/utils/db";
import env from "~/utils/env";
import { ModelFindSchema, ModelQuerySchema } from "~/utils/model";
import { NumberFilterSchema, StringFilterSchema } from "~/utils/prisma";

export const modelRouter = createRouter()
  .query("browse", {
    input: ModelQuerySchema,
    resolve: withAuthResolver(async ({ ctx, input }) => {
      const { domain, opts } = input;
      return await DB.app(env("APPLICATION_KEY")).from(domain).query(opts).ids();
    }),
  })
  .query("count", {
    input: ModelQuerySchema,
    resolve: withAuthResolver(async ({ ctx, input }) => {
      const { domain, opts } = input;
      return await DB.app(env("APPLICATION_KEY")).from(domain).query(opts).count();
    }),
  })
  .mutation("drop", {
    input: z.object({
      domain: z.string(),
      id: z.string().cuid(),
    }),
    resolve: withAuthResolver(async ({ ctx, input }) => {
      const { domain, id } = input;
      await DB.app(env("APPLICATION_KEY")).from(domain).drop(id);
    }),
  })
  .merge(
    "find.",
    createRouter()
      .query("text", {
        input: ModelFindSchema({ where: z.string().or(StringFilterSchema) }),
        resolve: withAuthResolver(async ({ ctx, input }) => {
          const { domain, key, where } = input;
          const find = DB.app(env("APPLICATION_KEY")).from(domain).query().find(key);
          const entities = await find.text(where);
          return entities.map((entity) => entity.id);
        }),
      })
      .query("document", {
        input: ModelFindSchema({ where: z.string().or(StringFilterSchema) }),
        resolve: withAuthResolver(async ({ ctx, input }) => {
          const { domain, key, where } = input;
          const find = DB.app(env("APPLICATION_KEY")).from(domain).query().find(key);
          const entities = await find.document(where);
          return entities.map((entity) => entity.id);
        }),
      })
      .query("numeric", {
        input: ModelFindSchema({ where: z.number().or(NumberFilterSchema) }),
        resolve: withAuthResolver(async ({ ctx, input }) => {
          const { domain, key, where } = input;
          const find = DB.app(env("APPLICATION_KEY")).from(domain).query().find(key);
          const entities = await find.numeric(where);
          return entities.map((entity) => entity.id);
        }),
      }),
  )
  .merge(
    "text.",
    createRouter()
      .query("get", {
        input: z.object({
          domain: z.string(),
          id: z.string().cuid(),
          key: z.string(),
        }),
        resolve: withAuthResolver(async ({ ctx, input }) => {
          const { domain, id, key } = input;
          const attribute = await DB.app(env("APPLICATION_KEY")).from(domain).id(id).get(key).text();
          return attribute?.value ?? "";
        }),
      })
      .mutation("set", {
        input: z.object({
          domain: z.string(),
          id: z.string().cuid(),
          key: z.string(),
          value: z.string(),
        }),
        resolve: withAuthResolver(async ({ ctx, input }) => {
          const { domain, id, key, value } = input;
          await DB.app(env("APPLICATION_KEY")).from(domain).id(id).set(key).text(value);
        }),
      })
      .mutation("drop", {
        input: z.object({
          domain: z.string(),
          id: z.string().cuid(),
          key: z.string(),
        }),
        resolve: withAuthResolver(async ({ ctx, input }) => {
          const { domain, id, key } = input;
          await DB.app(env("APPLICATION_KEY")).from(domain).id(id).drop(key);
        }),
      }),
  )
  .merge(
    "document.",
    createRouter()
      .query("get", {
        input: z.object({
          domain: z.string(),
          id: z.string().cuid(),
          key: z.string(),
        }),
        resolve: withAuthResolver(async ({ ctx, input }) => {
          const { domain, id, key } = input;
          const attribute = await DB.app(env("APPLICATION_KEY")).from(domain).id(id).get(key).document();
          return attribute?.value ?? "";
        }),
      })
      .mutation("set", {
        input: z.object({
          domain: z.string(),
          id: z.string().cuid(),
          key: z.string(),
          value: z.string(),
        }),
        resolve: withAuthResolver(async ({ ctx, input }) => {
          const { domain, id, key, value } = input;
          await DB.app(env("APPLICATION_KEY")).from(domain).id(id).set(key).document(value);
        }),
      })
      .mutation("drop", {
        input: z.object({
          domain: z.string(),
          id: z.string().cuid(),
          key: z.string(),
        }),
        resolve: withAuthResolver(async ({ ctx, input }) => {
          const { domain, id, key } = input;
          await DB.app(env("APPLICATION_KEY")).from(domain).id(id).drop(key);
        }),
      }),
  )
  .merge(
    "numeric.",
    createRouter()
      .query("get", {
        input: z.object({
          domain: z.string(),
          id: z.string().cuid(),
          key: z.string(),
        }),
        resolve: withAuthResolver(async ({ ctx, input }) => {
          const { domain, id, key } = input;
          const attribute = await DB.app(env("APPLICATION_KEY")).from(domain).id(id).get(key).numeric();
          return attribute?.value ?? 0;
        }),
      })
      .mutation("set", {
        input: z.object({
          domain: z.string(),
          id: z.string().cuid(),
          key: z.string(),
          value: z.number(),
        }),
        resolve: withAuthResolver(async ({ ctx, input }) => {
          const { domain, id, key, value } = input;
          await DB.app(env("APPLICATION_KEY")).from(domain).id(id).set(key).numeric(value);
        }),
      })
      .mutation("drop", {
        input: z.object({
          domain: z.string(),
          id: z.string().cuid(),
          key: z.string(),
        }),
        resolve: withAuthResolver(async ({ ctx, input }) => {
          const { domain, id, key } = input;
          await DB.app(env("APPLICATION_KEY")).from(domain).id(id).drop(key);
        }),
      }),
  )
  .merge(
    "file.",
    createRouter()
      .query("get", {
        input: z.object({
          domain: z.string(),
          id: z.string().cuid(),
          key: z.string(),
        }),
        resolve: withAuthResolver(async ({ ctx, input }) => {
          const { domain, id, key } = input;
          const attribute = await DB.app(env("APPLICATION_KEY")).from(domain).id(id).get(key).file();
          return Array.from(new Uint8Array(attribute?.value ?? Buffer.from(Uint8Array.from([]))));
        }),
      })
      .mutation("set", {
        input: z.object({
          domain: z.string(),
          id: z.string().cuid(),
          key: z.string(),
          value: z.array(z.number()),
        }),
        resolve: withAuthResolver(async ({ ctx, input }) => {
          const { domain, id, key, value } = input;
          await DB.app(env("APPLICATION_KEY")).from(domain).id(id).set(key).file(value);
        }),
      })
      .mutation("drop", {
        input: z.object({
          domain: z.string(),
          id: z.string().cuid(),
          key: z.string(),
        }),
        resolve: withAuthResolver(async ({ ctx, input }) => {
          const { domain, id, key } = input;
          await DB.app(env("APPLICATION_KEY")).from(domain).id(id).drop(key);
        }),
      }),
  );
