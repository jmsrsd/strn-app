import { Context } from "../context";

export class Attribute {
  private ctx: Context;

  private constructor(ctx: Context) {
    this.ctx = ctx;
  }

  static of(ctx: Context) {
    return new Attribute(ctx);
  }

  private get database() {
    return this.ctx.prisma.strn__attribute;
  }

  async id(entityId: string, key: string) {
    const id = await this.database
      .findFirst({
        select: {
          id: true,
        },
        where: {
          key,
          entityId,
        },
      })
      .then((attribute) => attribute?.id);
    if (!!id) return id;
    return await this.database
      .create({
        select: {
          id: true,
        },
        data: {
          key,
          entityId,
        },
      })
      .then((attribute) => attribute.id);
  }

  async delete(entityId: string, key: string) {
    const id = await this.id(entityId, key);
    await this.database.deleteMany({
      where: {
        id,
        entityId,
        key,
      },
    });
  }
}
