import * as trpc from "@trpc/server";
import { Context } from "~/server/context";

export type Nullish = null | undefined;

export type AsNullish<T extends any> = T | Nullish;

export type ProcedureResolverProps<TInput> = {
  ctx: Context;
  input: TInput;
  type: trpc.ProcedureType;
};

export type ProcedureResolver<TInput, TOutput> = (
  opts: ProcedureResolverProps<TInput>,
) => Promise<TOutput> | TOutput;

export const ToString = <T>(ctor: { new(): T }) => ctor.name;
