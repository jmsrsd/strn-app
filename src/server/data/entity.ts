import { Context } from "../context";
import { Domain } from "./domain";

export class Entity {
  private ctx: Context;

  private constructor(ctx: Context) {
    this.ctx = ctx;
  }

  static of(ctx: Context) {
    return new Entity(ctx);
  }

  private get database() {
    return this.ctx.prisma.strn__entity;
  }

  private get domain() {
    return Domain.of(this.ctx);
  }

  async create(applicationKey: string, domainKey: string) {
    const domainId = await this.domain.id(applicationKey, domainKey);
    return await this.database
      .create({
        select: {
          id: true,
        },
        data: {
          domainId,
        },
      })
      .then((entity) => entity.id);
  }

  async delete(applicationKey: string, domainKey: string, id: string) {
    const domainId = await this.domain.id(applicationKey, domainKey);
    await this.database.deleteMany({
      where: {
        id,
        domainId,
      },
    });
  }

  async exist(applicationKey: string, domainKey: string, id: string) {
    const domainId = await this.domain.id(applicationKey, domainKey);
    return await this.database
      .findFirst({
        select: {
          id: true,
        },
        where: {
          id,
          domainId,
        },
      })
      .then((entity) => !!entity?.id);
  }

  async ids(
    applicationKey: string,
    domainKey: string,
    options?:
      | { skip?: number | undefined; take?: number | undefined }
      | undefined
  ) {
    const domainId = await this.domain.id(applicationKey, domainKey);
    const { skip, take } = options ?? {};
    return await this.database
      .findMany({
        select: {
          id: true,
        },
        where: {
          domainId,
        },
        orderBy: {
          id: "desc",
        },
        skip,
        take,
      })
      .then((entities) => entities.map((entity) => entity.id));
  }

  async count(applicationKey: string, domainKey: string) {
    const domainId = await this.domain.id(applicationKey, domainKey);
    return await this.database.count({
      where: {
        domainId,
      },
    });
  }
}
