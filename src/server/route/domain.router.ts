import { z } from "zod";
import { createRouter, withRouteAuth } from "~/server/router";
import { Domain } from "../data/domain";
import { appKey } from "./app.router";

export const domainKey = "domain";

export const domainRouter = createRouter()
  .query("keys", {
    resolve: withRouteAuth(async ({ ctx }) => {
      const domain = Domain.of(ctx);
      return await domain.keys(appKey);
    }),
  })
  .mutation("add", {
    input: z.string(),
    resolve: withRouteAuth(async ({ ctx, input: key }) => {
      const domain = Domain.of(ctx);
      return await domain.id(appKey, key);
    }),
  })
  .mutation("remove", {
    input: z.string(),
    resolve: withRouteAuth(async ({ ctx, input: key }) => {
      const domain = Domain.of(ctx);
      await domain.remove(appKey, key);
    }),
  });
