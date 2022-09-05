import { Nullish } from "~/utils/nullish";
import { Context } from "../context";

export type Document = "user" | "post" | Nullish;

export async function getDocumentIds(ctx: Context, document: Document) {
  const strnDocument = ctx.prisma.strnDocument;
  return await strnDocument
    .findMany({
      where: {
        key: document,
      },
    })
    .then((documents) => documents.map((d) => d.id));
}

export async function createDocument(ctx: Context, document: Document) {
  const strnDocument = ctx.prisma.strnDocument;
  return await strnDocument
    .create({
      data: {
        key: document,
      },
    })
    .then((d) => d.id);
}
