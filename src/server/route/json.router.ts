import * as trpc from "@trpc/server";
import { z } from "zod";
import { createRouter } from "../createRouter";

export const jsonRouter = createRouter()
  .query("test", {
    async resolve({ ctx }) {
      await ctx.prisma.json.create({
        data: {
          value: {
            createdAt: +Date.now(),
          },
        },
      });

      return ctx.prisma.json.findMany();
    },
  })
  .query("browse", {
    async resolve({ ctx }) {
      return await ctx.prisma.json.findMany();
    },
  })
  .query("read", {
    input: z.object({
      key: z.string(),
    }),
    async resolve({ input, ctx }) {
      return await ctx.prisma.json.findUnique({
        where: {
          key: input.key,
        },
      });
    },
  })

  .mutation("add", {
    input: z.object({
      type: z.string().nullish(),
      value: z.object({
        key: z.string().nullish(),
        value: z.any(),
      }),
    }),
    async resolve({ ctx, input }) {
      if (!ctx.user) {
        new trpc.TRPCError({
          code: "FORBIDDEN",
          message: "Can not add a json while logged out",
        });
      }

      return await ctx.prisma.json.create({
        data: input,
      });
    },
  });
