import { z } from 'zod';
import {
    App,
    app,
    apps,
    Collection,
    collection,
    collections,
    Document,
    document,
    documents,
    File,
    Numeric,
    numerics,
    Text,
    texts,
} from '~/utils/strn';

import { createRouter, withAuthResolver } from '../router';

const StrnWhereSchema = z
  .object({
    id: z.string(),
  })
  .or(
    z.object({
      key: z.string(),
    })
  );

export const strnRouter = createRouter()
  .merge(
    "app.",
    createRouter()
      .query("get", {
        input: StrnWhereSchema,
        resolve: withAuthResolver(async ({ ctx, input }) => {
          return await app(input);
        }),
      })
      .query("browse", {
        input: z.never(),
        resolve: withAuthResolver(async ({ ctx }) => {
          return await apps();
        }),
      })
      .mutation("create", {
        input: z.object({
          key: z.string(),
        }),
        resolve: withAuthResolver(async ({ ctx, input }) => {
          const { key } = input;
          await App().create(key);
        }),
      })
      .mutation("delete", {
        input: z.object({
          id: z.string(),
        }),
        resolve: withAuthResolver(async ({ ctx, input }) => {
          const { id } = input;
          await App().delete(id);
        }),
      })
  )
  .merge(
    "collection.",
    createRouter()
      .query("get", {
        input: StrnWhereSchema.and(
          z.object({
            appid: z.string().optional(),
          })
        ),
        resolve: withAuthResolver(async ({ ctx, input }) => {
          return await collection(input);
        }),
      })
      .query("browse", {
        input: z.object({
          appid: z.string().optional(),
        }),
        resolve: withAuthResolver(async ({ ctx, input }) => {
          const { appid } = input;
          return await collections(appid);
        }),
      })
      .mutation("create", {
        input: z.object({
          appkey: z.string(),
          key: z.string(),
        }),
        resolve: withAuthResolver(async ({ ctx, input }) => {
          const { appkey, key } = input;
          await Collection(appkey).create(key);
        }),
      })
      .mutation("delete", {
        input: z.object({
          appkey: z.string(),
          id: z.string(),
        }),
        resolve: withAuthResolver(async ({ ctx, input }) => {
          const { appkey, id } = input;
          await Collection(appkey).delete(id);
        }),
      })
      .mutation("deleteAll", {
        input: z.object({
          appkey: z.string(),
        }),
        resolve: withAuthResolver(async ({ ctx, input }) => {
          const { appkey } = input;
          await Collection(appkey).deleteAll();
        }),
      })
  )
  .merge(
    "document.",
    createRouter()
      .query("get", {
        input: z.object({
          id: z.string().optional(),
          collectionid: z.string().optional(),
        }),
        resolve: withAuthResolver(async ({ ctx, input }) => {
          return await document(input);
        }),
      })
      .query("browse", {
        input: z.object({
          collectionid: z.string().optional(),
        }),
        resolve: withAuthResolver(async ({ ctx, input }) => {
          const { collectionid } = input;
          return await documents(collectionid);
        }),
      })
      .mutation("create", {
        input: z.object({
          appkey: z.string(),
          collectionkey: z.string(),
        }),
        resolve: withAuthResolver(async ({ ctx, input }) => {
          const { appkey, collectionkey } = input;
          await Document(appkey, collectionkey).create();
        }),
      })
      .mutation("delete", {
        input: z.object({
          appkey: z.string(),
          collectionkey: z.string(),
          id: z.string(),
        }),
        resolve: withAuthResolver(async ({ ctx, input }) => {
          const { appkey, collectionkey, id } = input;
          await Document(appkey, collectionkey).delete(id);
        }),
      })
      .mutation("deleteAll", {
        input: z.object({
          appkey: z.string(),
          collectionkey: z.string(),
        }),
        resolve: withAuthResolver(async ({ ctx, input }) => {
          const { appkey, collectionkey } = input;
          await Document(appkey, collectionkey).deleteAll();
        }),
      })
  )
  .merge(
    "text.",
    createRouter()
      .query("get", {
        input: z.object({
          documentid: z.string(),
          key: z.string(),
        }),
        resolve: withAuthResolver(async ({ ctx, input }) => {
          const { documentid, key } = input;
          return await Text(documentid).get(key);
        }),
      })
      .query("find", {
        input: z
          .object({
            contains: z.string().optional(),
            endsWith: z.string().optional(),
            equals: z.string().optional(),
            gt: z.string().optional(),
            gte: z.string().optional(),
            lt: z.string().optional(),
            lte: z.string().optional(),
            startsWith: z.string().optional(),
            in: z.string().optional().or(z.array(z.string()).optional()),
          })
          .or(z.string()),
        resolve: withAuthResolver(async ({ ctx, input }) => {
          return await texts(input);
        }),
      })
      .mutation("set", {
        input: z.object({
          documentid: z.string(),
          key: z.string(),
          value: z.string(),
        }),
        resolve: withAuthResolver(async ({ ctx, input }) => {
          const { documentid, key, value } = input;
          await Text(documentid).set(key, value);
        }),
      })
      .mutation("deleteAll", {
        input: z.object({
          documentid: z.string(),
        }),
        resolve: withAuthResolver(async ({ ctx, input }) => {
          const { documentid } = input;
          await Text(documentid).deleteAll();
        }),
      })
  )
  .merge(
    "numeric.",
    createRouter()
      .query("get", {
        input: z.object({
          documentid: z.string(),
          key: z.string(),
        }),
        resolve: withAuthResolver(async ({ ctx, input }) => {
          const { documentid, key } = input;
          return await Numeric(documentid).get(key);
        }),
      })
      .query("find", {
        input: z
          .object({
            equals: z.number().optional(),
            gt: z.number().optional(),
            gte: z.number().optional(),
            lt: z.number().optional(),
            lte: z.number().optional(),
            in: z.number().optional().or(z.array(z.number()).optional()),
          })
          .or(z.number()),
        resolve: withAuthResolver(async ({ ctx, input }) => {
          return await numerics(input);
        }),
      })
      .mutation("set", {
        input: z.object({
          documentid: z.string(),
          key: z.string(),
          value: z.number(),
        }),
        resolve: withAuthResolver(async ({ ctx, input }) => {
          const { documentid, key, value } = input;
          await Numeric(documentid).set(key, value);
        }),
      })
      .mutation("deleteAll", {
        input: z.object({
          documentid: z.string(),
        }),
        resolve: withAuthResolver(async ({ ctx, input }) => {
          const { documentid } = input;
          await Numeric(documentid).deleteAll();
        }),
      })
  )
  .merge(
    "file.",
    createRouter()
      .query("get", {
        input: z.object({
          documentid: z.string(),
          key: z.string(),
        }),
        resolve: withAuthResolver(async ({ ctx, input }) => {
          const { documentid, key } = input;
          return await File(documentid).get(key);
        }),
      })
      .mutation("set", {
        input: z.object({
          documentid: z.string(),
          key: z.string(),
          value: z.array(z.number()),
        }),
        resolve: withAuthResolver(async ({ ctx, input }) => {
          const { documentid, key, value } = input;
          await File(documentid).set(key, Buffer.from(Uint8Array.from(value)));
        }),
      })
      .mutation("deleteAll", {
        input: z.object({
          documentid: z.string(),
        }),
        resolve: withAuthResolver(async ({ ctx, input }) => {
          const { documentid } = input;
          await File(documentid).deleteAll();
        }),
      })
  );
