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
    return this.ctx.prisma.strn_text;
  }

  private get attribute() {
    return Attribute.of(this.ctx);
  }

  async id(entity_id: string, attribute_key: string) {
    const attribute_id = await this.attribute.id(entity_id, attribute_key);
    const id = await this.database
      .findFirst({
        select: {
          id: true,
        },
        where: {
          attribute_id,
        },
      })
      .then((field) => {
        return field?.id;
      });
    if (!!id) return id;
    return await this.database
      .create({
        select: {
          id: true,
        },
        data: {
          attribute_id,
          text: "",
        },
      })
      .then((attribute) => {
        return attribute.id;
      });
  }

  async get(entity_id: string, attribute_key: string) {
    const attribute_id = await this.attribute.id(entity_id, attribute_key);
    return await this.database
      .findFirst({
        select: {
          text: true,
        },
        where: {
          attribute_id,
        },
      })
      .then((field) => {
        return field?.text;
      });
  }

  async set(entity_id: string, attribute_key: string, text: string) {
    const id = await this.id(entity_id, attribute_key);
    await this.database.update({
      where: {
        id,
      },
      data: {
        text,
      },
    });
  }

  async unset(entity_id: string, attribute_key: string) {
    const attribute_id = await this.attribute.id(entity_id, attribute_key);
    await this.database.deleteMany({
      where: {
        attribute_id,
      },
    });
  }
}
