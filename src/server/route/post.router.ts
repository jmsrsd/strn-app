import { z } from "zod";
import { Context } from "~/server/context";
import { createRouter, withRouteAuth } from "~/server/router";
import { Database, Domain } from "../database";
import { appKey } from "./app.router";

export const postKey = "post";

const Model = (ctx: Context, domain: string, args: { id: string; key: string }) => {
  const { id, key } = args;
  const query = new Database(ctx).application(appKey).domain(domain).entity(id).attribute(key);
  return {
    text: query.text.get,
    numeric: query.numeric.get,
    document: query.document.get,
    file: query.file.get,
  };
};

export const postRouter = createRouter()
  .query("text", {
    input: z.object({
      id: z.string(),
      key: z.string(),
    }),
    resolve: withRouteAuth(async ({ ctx, input }) => {
      return await Model(ctx, "post", input).text();
    }),
  })
  .query("numeric", {
    input: z.object({
      id: z.string(),
      key: z.string(),
    }),
    resolve: withRouteAuth(async ({ ctx, input }) => {
      return await Model(ctx, "post", input).numeric();
    }),
  })
  .query("document", {
    input: z.object({
      id: z.string(),
      key: z.string(),
    }),
    resolve: withRouteAuth(async ({ ctx, input }) => {
      return await Model(ctx, "post", input).document();
    }),
  })
  .query("file", {
    input: z.object({
      id: z.string(),
      key: z.string(),
    }),
    resolve: withRouteAuth(async ({ ctx, input }) => {
      return await Model(ctx, "post", input).file();
    }),
  })
  .query("author_id", {
    input: z.string(),
    resolve: withRouteAuth(async ({ ctx, input: id }) => {
      return await new Database(ctx).text({
        where: {
          applicationKey: appKey,
          domainKey: postKey,
          entityId: id,
          attributeKey: "author_id",
        },
      });
    }),
  })
  .query("titles", {
    resolve: withRouteAuth(async ({ ctx }) => {
      // const entity = Entity.of(ctx);
      // const ids = await entity.ids(appKey, postKey);
      // const text = Text.of(ctx);
      // return Object.fromEntries(
      //   await Promise.all(
      //     ids.map(async (id) => {
      //       return [id, await text.get(id, "title")];
      //     })
      //   ).then((titles) => {
      //     return titles
      //       .filter((title) => !!title[1])
      //       .map((title) => [title[0], title[1] as string] as string[]);
      //   })
      // ) as { [key: string]: string };
      return {};
    }),
  })
  .mutation("add", {
    input: z.object({
      title: z.string(),
    }),
    resolve: withRouteAuth(async ({ ctx, input }) => {
      const { title } = input;
      // const entity = Entity.of(ctx);
      // const entityId = await entity.create(appKey, postKey);
      // const text = Text.of(ctx);
      // await text.set(entityId, "title", title);
    }),
  })
  .mutation("remove", {
    input: z.object({
      id: z.string(),
    }),
    resolve: withRouteAuth(async ({ ctx, input }) => {
      const { id } = input;
      // const entity = Entity.of(ctx);
      // const text = Text.of(ctx);
      // await text.unset(id, "title");
      // await entity.delete(appKey, postKey, id);
    }),
  });
