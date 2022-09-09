import { Context } from "../context";
import { Attribute } from "./attribute";
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
    return this.ctx.prisma.strn_entity;
  }

  private get domain() {
    return Domain.of(this.ctx);
  }

  async create(application_key: string, domain_key: string) {
    const domain_id = await this.domain.id(application_key, domain_key);
    return await this.database
      .create({
        select: {
          id: true,
        },
        data: {
          domain_id,
        },
      })
      .then((entity) => {
        return entity.id;
      });
  }

  async delete(application_key: string, domain_key: string, id: string) {
    const attribute = Attribute.of(this.ctx);
    const attibute_keys = await attribute.keys(id);
    await Promise.all(
      attibute_keys.map(async (attibute_key) => {
        await attribute.delete(id, attibute_key);
      })
    );
    const domain_id = await this.domain.id(application_key, domain_key);
    await this.database.deleteMany({
      where: {
        id,
        domain_id,
      },
    });
  }

  async exist(application_key: string, domain_key: string, id: string) {
    const domain_id = await this.domain.id(application_key, domain_key);
    return await this.database
      .findFirst({
        select: {
          id: true,
        },
        where: {
          id,
          domain_id,
        },
      })
      .then((entity) => {
        return !!entity?.id;
      });
  }

  async ids(
    application_key: string,
    domain_key: string,
    options?:
      | { skip?: number | undefined; take?: number | undefined }
      | undefined
  ) {
    const domain_id = await this.domain.id(application_key, domain_key);
    const { skip, take } = options ?? {};
    return await this.database
      .findMany({
        select: {
          id: true,
        },
        where: {
          domain_id,
        },
        orderBy: {
          id: "desc",
        },
        skip,
        take,
      })
      .then((entities) => {
        return entities.map((entity) => {
          return entity.id;
        });
      });
  }

  async count(application_key: string, domain_key: string) {
    const domain_id = await this.domain.id(application_key, domain_key);
    return await this.database.count({
      where: {
        domain_id,
      },
    });
  }
}
