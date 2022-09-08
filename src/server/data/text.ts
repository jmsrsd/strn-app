import { Context } from "../context";
import { Attribute } from "./attribute";

export class Text {
  private ctx: Context;

  private constructor(ctx: Context) {
    this.ctx = ctx;
  }

  static of(ctx: Context) {
    return new Text(ctx);
  }

  private get database() {
    return this.ctx.prisma.strnText;
  }

  private get attribute() {
    return Attribute.of(this.ctx);
  }

  async id(entityId: string, attributeKey: string) {
    const attributeId = await this.attribute.id(entityId, attributeKey);
    const id = await this.database
      .findFirst({
        select: {
          id: true,
        },
        where: {
          attributeId,
        },
      })
      .then((field) => field?.id);
    if (!!id) return id;
    return await this.database
      .create({
        select: {
          id: true,
        },
        data: {
          attributeId,
          text: "",
        },
      })
      .then((attribute) => attribute.id);
  }

  async get(entityId: string, attributeKey: string) {
    const attributeId = await this.attribute.id(entityId, attributeKey);
    return await this.database
      .findFirst({
        select: {
          text: true,
        },
        where: {
          attributeId,
        },
      })
      .then((field) => field?.text);
  }

  async set(entityId: string, attributeKey: string, text: string) {
    const id = await this.id(entityId, attributeKey);
    await this.database.update({
      where: {
        id,
      },
      data: {
        text,
      },
    });
  }

  async unset(entityId: string, attributeKey: string) {
    const attributeId = await this.attribute.id(entityId, attributeKey);
    await this.database.deleteMany({
      where: {
        attributeId,
      },
    });
  }
}
