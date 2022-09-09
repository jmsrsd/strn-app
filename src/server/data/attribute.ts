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
    return this.ctx.prisma.strn_attribute;
  }

  async id(entity_id: string, key: string) {
    const id = await this.database
      .findFirst({
        select: {
          id: true,
        },
        where: {
          key,
          entity_id,
        },
      })
      .then((attribute) => {
        return attribute?.id;
      });
    if (!!id) return id;
    return await this.database
      .create({
        select: {
          id: true,
        },
        data: {
          key,
          entity_id,
        },
      })
      .then((attribute) => {
        return attribute.id;
      });
  }

  async keys(entity_id: string) {
    return await this.database
      .findMany({
        select: {
          key: true,
        },
        where: {
          entity_id,
        },
      })
      .then((attributes) => {
        return attributes.map((attribute) => {
          return attribute.key;
        });
      });
  }

  async delete(entity_id: string, key: string) {
    await Text.of(this.ctx).unset(entity_id, key);
    const id = await this.id(entity_id, key);
    await this.database.deleteMany({
      where: {
        id,
        entity_id,
        key,
      },
    });
  }
}
