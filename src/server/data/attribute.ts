import { Context } from "../context";
import { Text } from "./text";

export class Attribute {
  private ctx: Context;

  private constructor(ctx: Context) {
    this.ctx = ctx;
  }

  static of(ctx: Context) {
    return new Attribute(ctx);
  }

  private get database() {
    return this.ctx.prisma.strnAttribute;
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

  async keys(entityId: string) {
    return await this.database
      .findMany({
        select: {
          key: true,
        },
        where: {
          entityId,
        },
      })
      .then((attributes) => attributes.map((attribute) => attribute.key));
  }

  async delete(entityId: string, key: string) {
    await Text.of(this.ctx).unset(entityId, key);
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
