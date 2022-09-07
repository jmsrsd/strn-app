import { z } from "zod";
import { getUserRole } from "~/utils/user";

import * as rest from "~/server/rest";
import { createRouter, withRouteAuth } from "~/server/router";

export const dataKey = "data";

export const dataRouter = createRouter()
  .query("me", {
    resolve: withRouteAuth(async ({ ctx }) => {
      const { req, res } = ctx;
      return await getUserRole({ req, res });
    }),
  })
  .query("browse", {
    resolve: withRouteAuth(async ({ ctx }) => {
      return await ctx.prisma.data_.findMany();
    }),
  })
  .query("test", {
    resolve: withRouteAuth(async ({ ctx }) => {
      await rest.post({ ctx, input: { value: {} } });
      return await ctx.prisma.data_.findMany();
    }),
  })
  .query("read", {
    input: z.object({
      id: z.string(),
    }),
    resolve: withRouteAuth(async ({ ctx, input }) => {
      return await rest.get({ ctx, input });
    }),
  })
  .mutation("createOrUpdate", {
    input: z.object({
      id: z.string().nullish(),
      value: z.any(),
    }),
    resolve: withRouteAuth(async ({ ctx, input }) => {
      const { id, value } = input;
      if (!!id) {
        return await rest.put({ ctx, input: { id, value } });
      } else {
        return await rest.post({ ctx, input: { id, value } });
      }
    }),
  })
  .mutation("delete", {
    input: z.object({
      id: z.string(),
    }),
    resolve: withRouteAuth(async ({ ctx, input }) => {
      return await rest.delete({ ctx, input });
    }),
  })
  .mutation("clear", {
    input: z.void().or(z.null()).or(z.undefined()),
    resolve: withRouteAuth(async ({ ctx }) => {
      return await ctx.prisma.data_.deleteMany();
    }),
  });
