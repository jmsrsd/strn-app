import { z } from "zod";
import { createRouter, withRouteAuth } from "~/server/router";

export const domainKey = "domain";

export const domainRouter = createRouter()
  .query("keys", {
    resolve: withRouteAuth(async ({ ctx }) => {
      // const domain = Domain.of(ctx);
      // return await domain.keys(appKey);
      return [];
    }),
  })
  .mutation("add", {
    input: z.object({
      key: z.string(),
    }),
    resolve: withRouteAuth(async ({ ctx, input }) => {
      const { key } = input;
      // const domain = Domain.of(ctx);
      // return await domain.id(appKey, key);
      return "";
    }),
  })
  .mutation("remove", {
    input: z.object({
      key: z.string(),
    }),
    resolve: withRouteAuth(async ({ ctx, input }) => {
      const { key } = input;
      // const domain = Domain.of(ctx);
      // await domain.remove(appKey, key);
    }),
  });
