import * as trpc from "@trpc/server";
import { InferLast, router } from "@trpc/server";
import superjson from "superjson";
import { Context } from "./context";

export function createRouter() {
  return router<Context>().transformer(superjson);
}

type ProcedureResolverProps<TInput> = {
  ctx: Context;
  input: TInput;
  type: trpc.ProcedureType;
};

export type ProcedureResolver<TInput, TOutput> = (
  opts: ProcedureResolverProps<TInput>
) => Promise<TOutput> | TOutput;

export function withRouteAuth<TInput, TOutput>(
  resolve: ProcedureResolver<TInput, InferLast<TOutput>>
) {
  return async (props: ProcedureResolverProps<TInput>) => {
    if (!!(props.ctx as Context).user) return await resolve(props);
    throw new trpc.TRPCError({
      code: "FORBIDDEN",
      message: "Can not add a json while logged out",
    });
  };
}

export function withoutRouteAuth<TInput, TOutput>(
  resolve: ProcedureResolver<TInput, InferLast<TOutput>>
) {
  return async (props: ProcedureResolverProps<TInput>) => {
    return await resolve(props);
  };
}
