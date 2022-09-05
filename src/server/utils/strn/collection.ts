import { Context } from "../context";
import { Nullish } from "../../../utils/nullish";

export type Collection = "strn-blog-app" | Nullish;

export async function getNullishCollectionId(
  ctx: Context,
  collection: Collection
) {
  const strnCollection = ctx.prisma.strnCollection;
  return await strnCollection
    .findFirst({
      where: {
        key: {
          equals: collection,
        },
      },
    })
    .then((collected) => collected?.id);
}

export async function getCollectionId(ctx: Context, collection: Collection) {
  const strnCollection = ctx.prisma.strnCollection;
  return await getNullishCollectionId(ctx, collection).then(async (id) => {
    if (!!id) return id;
    return await strnCollection
      .create({
        data: {
          key: collection,
        },
      })
      .then((collected) => collected.id);
  });
}
