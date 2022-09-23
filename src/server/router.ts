import * as trpc from "@trpc/server";
import { InferLast, router } from "@trpc/server";
import superjson from "superjson";
import { ProcedureResolver, ProcedureResolverProps } from "~/utils/types";
import { Context } from "./context";

export function createRouter() {
  return router<Context>().transformer(superjson);
}

export function withAuthResolver<TInput, TOutput>(
  resolve: ProcedureResolver<TInput, InferLast<TOutput>>
) {
  return async (props: ProcedureResolverProps<TInput>) => {
    if (!!(props.ctx as Context).user) return await resolve(props);
    throw new trpc.TRPCError({
      code: "FORBIDDEN",
      message: "Can not proceed while logged out",
    });
  };
}

export function withoutAuthResolver<TInput, TOutput>(
  resolve: ProcedureResolver<TInput, InferLast<TOutput>>
) {
  return async (props: ProcedureResolverProps<TInput>) => {
    return await resolve(props);
  };
}
