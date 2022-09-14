import { toZod } from "tozod";
import { z } from "zod";
import { createRouter, withAuthResolver } from "~/server/router";
import { appRoute } from "./app.router";

export type Entity = {
  id: string;
  createdBy: string;
  createdAt: number;
  updatedBy: string;
  updatedAt: number;
};

export const EntitySchema: toZod<Entity> = z.late.object(() => ({
  id: z.string(),
  createdBy: z.string(),
  createdAt: z.number(),
  updatedBy: z.string(),
  updatedAt: z.number(),
}));

export const entityRouter = createRouter()
  .mutation("drop", {
    input: z.string(),
    resolve: withAuthResolver(async ({ ctx, input }) => {
      await ctx.db(appRoute).drop(input);
    }),
  });
