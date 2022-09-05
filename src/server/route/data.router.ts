import { z } from "zod";
import { getUserRole } from "~/utils/user";

import * as rest from "../utils/rest";
import { createRouter, withRouterAuth } from "../utils/router";

export const dataRouter = createRouter()
  .query("me", {
    resolve: withRouterAuth(async ({ ctx }) => {
      const { req, res } = ctx;
      return await getUserRole({ req, res });
    }),
  })
  .query("browse", {
    resolve: withRouterAuth(async ({ ctx }) => {
      return await ctx.prisma.data.findMany();
    }),
  })
  .query("test", {
    resolve: withRouterAuth(async ({ ctx }) => {
      await rest.post({ ctx, input: { value: {} } });
      return await ctx.prisma.data.findMany();
    }),
  })
  .query("read", {
    input: z.object({
      id: z.string(),
    }),
    resolve: withRouterAuth(async ({ ctx, input }) => {
      return await rest.get({ ctx, input });
    }),
  })
  .mutation("createOrUpdate", {
    input: z.object({
      id: z.string().nullish(),
      value: z.any(),
    }),
    resolve: withRouterAuth(async ({ ctx, input }) => {
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
    resolve: withRouterAuth(async ({ ctx, input }) => {
      return await rest.delete({ ctx, input });
    }),
  })
  .mutation("clear", {
    resolve: withRouterAuth(async ({ ctx }) => {
      return await ctx.prisma.data.deleteMany();
    }),
  });
