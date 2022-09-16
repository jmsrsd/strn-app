import { PrismaClient } from "@prisma/client";
import { z } from "zod";

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export const serialize = (value: any) => {
  const stringified = JSON.stringify(value);
  const parsed = JSON.parse(stringified);
  return parsed;
};

export const EnumerableSchema = <T>(schema: z.ZodType<T>) => {
  return z.array(schema).or(schema);
};

export const EnumerableStringSchema = EnumerableSchema(z.string());

export const EnumerableNumberSchema = EnumerableSchema(z.number());

export type Enumerable<T> = T | T[];

export const StringFilterSchema = z.object({
  equals: z.string().optional(),
  in: EnumerableStringSchema.optional(),
  notIn: EnumerableStringSchema.optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
});

export type StringFilter = z.infer<typeof StringFilterSchema> & {
  not?: NestedStringFilter | string;
};

export type NestedStringFilter = z.infer<typeof StringFilterSchema> & {
  not?: NestedStringFilter | string;
};

export const NumberFilterSchema = z.object({
  equals: z.number().optional(),
  in: EnumerableNumberSchema.optional(),
  notIn: EnumerableNumberSchema.optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
});

export type FloatFilter = z.infer<typeof NumberFilterSchema> & {
  not?: NestedFloatFilter | number;
};

export type NestedFloatFilter = z.infer<typeof NumberFilterSchema> & {
  not?: NestedFloatFilter | number;
};
