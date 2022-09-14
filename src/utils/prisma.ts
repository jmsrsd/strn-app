import { PrismaClient } from "@prisma/client";

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

export type Enumerable<T> = T | Array<T>;

export type StringFilter = {
  equals?: string;
  in?: Enumerable<string>;
  notIn?: Enumerable<string>;
  lt?: string;
  lte?: string;
  gt?: string;
  gte?: string;
  contains?: string;
  startsWith?: string;
  endsWith?: string;
  not?: NestedStringFilter | string;
};

export type NestedStringFilter = {
  equals?: string;
  in?: Enumerable<string>;
  notIn?: Enumerable<string>;
  lt?: string;
  lte?: string;
  gt?: string;
  gte?: string;
  contains?: string;
  startsWith?: string;
  endsWith?: string;
  not?: NestedStringFilter | string;
};

export type FloatFilter = {
  equals?: number;
  in?: Enumerable<number>;
  notIn?: Enumerable<number>;
  lt?: number;
  lte?: number;
  gt?: number;
  gte?: number;
  not?: NestedFloatFilter | number;
};

export type NestedFloatFilter = {
  equals?: number;
  in?: Enumerable<number>;
  notIn?: Enumerable<number>;
  lt?: number;
  lte?: number;
  gt?: number;
  gte?: number;
  not?: NestedFloatFilter | number;
};
