import { Context } from "../context";
import { Attribute } from "./attribute";

export class TextField {
  private ctx: Context;

  private constructor(ctx: Context) {
    this.ctx = ctx;
  }

  static of(ctx: Context) {
    return new TextField(ctx);
  }

  private get database() {
    return this.ctx.prisma.strn__text_field;
  }

  async id(entityId: string, attributeKey: string) {
    const attributeId = await Attribute.of(this.ctx).id(entityId, attributeKey);
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
    const attributeId = await Attribute.of(this.ctx).id(entityId, attributeKey);
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
    const attributeId = await Attribute.of(this.ctx).id(entityId, attributeKey);
    await this.database.deleteMany({
      where: {
        attributeId,
      },
    });
  }
}

export class TextBlock {
  private ctx: Context;

  private constructor(ctx: Context) {
    this.ctx = ctx;
  }

  static of(ctx: Context) {
    return new TextBlock(ctx);
  }

  private get database() {
    return this.ctx.prisma.strn__text_block;
  }

  async id(entityId: string, attributeKey: string) {
    const attributeId = await Attribute.of(this.ctx).id(entityId, attributeKey);
    const id = await this.database
      .findFirst({
        select: {
          id: true,
        },
        where: {
          attributeId,
        },
      })
      .then((block) => block?.id);
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
    const attributeId = await Attribute.of(this.ctx).id(entityId, attributeKey);
    return await this.database
      .findFirst({
        select: {
          text: true,
        },
        where: {
          attributeId,
        },
      })
      .then((block) => block?.text);
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
    const attributeId = await Attribute.of(this.ctx).id(entityId, attributeKey);
    await this.database.deleteMany({
      where: {
        attributeId,
      },
    });
  }
}

export class TextDocument {
  private ctx: Context;

  private constructor(ctx: Context) {
    this.ctx = ctx;
  }

  static of(ctx: Context) {
    return new TextDocument(ctx);
  }

  private get database() {
    return this.ctx.prisma.strn__text_document;
  }

  async id(entityId: string, attributeKey: string) {
    const attributeId = await Attribute.of(this.ctx).id(entityId, attributeKey);
    const id = await this.database
      .findFirst({
        select: {
          id: true,
        },
        where: {
          attributeId,
        },
      })
      .then((document) => document?.id);
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
    const attributeId = await Attribute.of(this.ctx).id(entityId, attributeKey);
    return await this.database
      .findFirst({
        select: {
          text: true,
        },
        where: {
          attributeId,
        },
      })
      .then((document) => document?.text);
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
    const attributeId = await Attribute.of(this.ctx).id(entityId, attributeKey);
    await this.database.deleteMany({
      where: {
        attributeId,
      },
    });
  }
}
