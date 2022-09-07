import { Context } from "./context";
import { serialize } from "~/utils/prisma";

export function withMetaData(props: { ctx: Context; input?: any }) {
  const { ctx } = props;
  const input = props.input ?? {};
  const now = +Date.now();
  return {
    ...input,
    createdBy: input.createdBy ?? (ctx.user?.id as string),
    createdAt: input.createdAt ?? now,
    updatedBy: ctx.user?.id as string,
    updatedAt: now,
  };
}

export type DataKey = string | null | undefined;

export type DataValue = {
  parent?: string | null | undefined;
  key?: DataKey | "string" | "number";
  data?: string | number | null | undefined;
};

export type Data = {
  id: string;
  type?: "collection" | "document" | "field" | "data" | null | undefined;
  value?: DataValue | null | undefined;
};

export async function getCollections(ctx: Context) {
  const collections = await ctx.prisma.data_.findMany({
    where: {
      type: "collection",
    },
  });

  return collections
    .map((e) => serialize(e) as Data)
    .map((e) => {
      return {
        id: e.id,
        key: e.value?.key,
      };
    });
}

export async function getDocuments(ctx: Context, collection: string) {
  const result: { [key: string]: string[] } = {};
  const collected = await getCollections(ctx);
  if (collected.length < 1) return result;
  const { id, key } = collected[0];
  const documents = await ctx.prisma.data_.findMany({
    where: {
      type: "document",
      value: {
        path: "$.parent",
        equals: id,
      },
    },
  });
  const keys = documents
    .map((e) => serialize(e) as Data)
    .map((e) => e.value?.key);
  result[`${key}`] = Array.from(new Set(keys)).map((e) => `${e}`);
  return result;
}
