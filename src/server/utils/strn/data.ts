import { Prisma } from "@prisma/client";
import { Context } from "../context";
import { Collection, getCollectionId } from "./collection";
import { createDocument, Document } from "./document";
import { Id } from "./id";
import { Nullish } from "../../../utils/nullish";

export type DataKey = string | Nullish;

export type DataType = "string" | "number" | Nullish;

export type DataValue = string | number | Nullish;

export type Data = {
  id?: Id;
  collectionId?: Id;
  documentId?: Id;
  key?: DataKey;
  type?: DataType;
  value?: DataValue;
};

export async function createData(
  ctx: Context,
  collection: Collection,
  document: Document,
  values: { [key: string]: DataValue }
): Promise<Id> {
  const strnData = ctx.prisma.strnData;
  const collectionId = await getCollectionId(ctx, collection);
  const documentId = await createDocument(ctx, document);
  await strnData.createMany({
    data: await Promise.all(
      Object.keys(values).map(async (key) => {
        const value = values[key];
        const input: Prisma.strnDataCreateManyInput = {
          collectionId,
          documentId,
          key,
          type: typeof value,
          value: `${value}`,
        };
        return input;
      })
    ),
  });
  return documentId;
}

export async function getNullishData(
  ctx: Context,
  collection: Collection,
  documentId: Id,
  key: string
) {
  const strnData = ctx.prisma.strnData;
  const collectionId = await getCollectionId(ctx, collection);
  return await strnData.findFirst({
    where: {
      collectionId: {
        equals: collectionId,
      },
      documentId: {
        equals: documentId,
      },
      key: {
        equals: key,
      },
    },
  });
}

export async function getNullishDataValue(
  ctx: Context,
  collection: Collection,
  documentId: Id,
  key: string
) {
  const data = await getNullishData(ctx, collection, documentId, key);
  if (!data) return undefined;
  const { type } = data;
  const value = `${data.value}`;
  return type === "string" ? value : +value;
}

export async function updateData(
  ctx: Context,
  collection: Collection,
  documentId: Id,
  values: { [key: string]: DataValue }
) {
  const strnData = ctx.prisma.strnData;
  await Promise.all(
    Object.keys(values).map(async (key) => {
      const id = await getNullishData(ctx, collection, documentId, key).then(
        (nullish) => nullish?.id
      );
      if (!id) return;
      const value = values[key];
      await strnData.update({
        where: {
          id,
        },
        data: {
          value: `${value}`,
        },
      });
    })
  );
}

export async function deleteData(ctx: Context, documentId: Id) {
  const strnDcoument = ctx.prisma.strnDocument;
  const strnData = ctx.prisma.strnData;
  await strnData.deleteMany({
    where: {
      documentId: {
        equals: documentId,
      },
    },
  });
  await strnDcoument.deleteMany({
    where: {
      id: {
        equals: `${documentId}`,
      },
    },
  });
}
