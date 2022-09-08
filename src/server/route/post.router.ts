import { z } from "zod";
import { createRouter, withRouteAuth } from "~/server/router";
import { Entity } from "../data/entity";
import { Text } from "../data/text";
import { appKey } from "./app.router";

export const postKey = "post";

export const postRouter = createRouter()
  .query("titles", {
    resolve: withRouteAuth(async ({ ctx }) => {
      const entity = Entity.of(ctx);
      const ids = await entity.ids(appKey, postKey);
      const text = Text.of(ctx);
      return Object.fromEntries(
        await Promise.all(
          ids.map(async (id) => {
            return [id, await text.get(id, "title")];
          })
        ).then((titles) => {
          return titles
            .filter((title) => !!title[1])
            .map((title) => [title[0], title[1] as string] as string[]);
        })
      ) as { [key: string]: string };
    }),
  })
  .mutation("add", {
    input: z.object({
      title: z.string(),
    }),
    resolve: withRouteAuth(async ({ ctx, input }) => {
      const { title } = input;
      const entity = Entity.of(ctx);
      const entityId = await entity.create(appKey, postKey);
      const text = Text.of(ctx);
      await text.set(entityId, "title", title);
    }),
  })
  .mutation("remove", {
    input: z.object({
      id: z.string(),
    }),
    resolve: withRouteAuth(async ({ ctx, input }) => {
      const { id } = input;
      const entity = Entity.of(ctx);
      const text = Text.of(ctx);
      await text.unset(id, "title");
      await entity.delete(appKey, postKey, id);
    }),
  });
