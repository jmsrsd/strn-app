import { json } from "@prisma/client";
import * as trpc from "@trpc/server";
import { z } from "zod";
import { Context } from "../createContext";
import { createRouter } from "../createRouter";

type RowSchema = {
  key?: string;
  type?: string;
  value: {
    key?: string;
    value: {
      meta: {
        created: {
          by: string;
          at: number;
        };
        updated: {
          by: string;
          at: number;
        };
      };
      data: any;
    };
  };
};

function authenticateCtx(ctx: Context) {
  if (!ctx.user) {
    throw new trpc.TRPCError({
      code: "FORBIDDEN",
      message: "Can not add a json while logged out",
    });
  }
}

async function addJsonHandler({ ctx, input }: { ctx: Context; input: any }) {
  const now = +Date.now();
  const data: RowSchema = {
    value: {
      value: {
        meta: {
          created: {
            by: ctx.user?.id as string,
            at: now,
          },
          updated: {
            by: ctx.user?.id as string,
            at: now,
          },
        },
        data: input,
      },
    },
  };

  return await ctx.prisma.json.create({
    data: data,
  });
}

export const jsonRouter = createRouter()
  .query("test", {
    async resolve({ ctx }) {
      authenticateCtx(ctx);
      await addJsonHandler({ ctx, input: {} });
      return await ctx.prisma.json.findMany({});
    },
  })
  .query("browse", {
    async resolve({ ctx }) {
      authenticateCtx(ctx);
      return await ctx.prisma.json.findMany({});
    },
  })
  .query("read", {
    input: z.array(z.string()),
    async resolve({ input, ctx }) {
      authenticateCtx(ctx);
      return await ctx.prisma
        .$transaction(
          input.map((key) => {
            return ctx.prisma.json.findUnique({
              where: {
                key: key,
              },
            });
          })
        )
        .then((output) => {
          return output
            .filter((value) => value !== null)
            .map((value) => value as json);
        });
    },
  })
  .mutation("add", {
    input: z.any(),
    async resolve({ ctx, input }) {
      authenticateCtx(ctx);
      return await addJsonHandler({ ctx, input });
    },
  })
  .mutation("clear", {
    async resolve({ ctx, input }) {
      authenticateCtx(ctx);
      return await ctx.prisma.json.deleteMany({});
    },
  });
