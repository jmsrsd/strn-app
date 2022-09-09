import { Context } from "../context";
import { Application } from "./application";
import { Entity } from "./entity";

export class Domain {
  private ctx: Context;

  private constructor(ctx: Context) {
    this.ctx = ctx;
  }

  static of(ctx: Context) {
    return new Domain(ctx);
  }

  private get database() {
    return this.ctx.prisma.strn_domain;
  }

  private get application() {
    return Application.of(this.ctx);
  }

  async id(application_key: string, key: string) {
    const application_id = await this.application.id(application_key);
    const id = await this.database
      .findFirst({
        select: {
          id: true,
        },
        where: {
          application_id,
          key,
        },
      })
      .then((domain) => {
        return domain?.id;
      });
    if (!!id) return id;
    return await this.database
      .create({
        select: {
          id: true,
        },
        data: {
          application_id,
          key,
        },
      })
      .then((domain) => {
        return domain.id;
      });
  }

  async keys(application_key: string) {
    const application_id = await this.application.id(application_key);
    return await this.database
      .findMany({
        select: {
          key: true,
        },
        where: {
          application_id,
        },
        orderBy: {
          key: "asc",
        },
      })
      .then((domains) => {
        return domains.map((domain) => {
          return domain.key;
        });
      });
  }

  async count(application_key: string) {
    const application_id = await this.application.id(application_key);
    return await this.database.count({
      where: {
        application_id,
      },
    });
  }

  async remove(application_key: string, key: string) {
    const entity = Entity.of(this.ctx);
    const entity_ids = await entity.ids(application_key, key);
    await Promise.all(
      entity_ids.map(async (entity_id) => {
        await entity.delete(application_key, key, entity_id);
      })
    );
    const application_id = await this.application.id(application_key);
    await this.database.deleteMany({
      where: {
        application_id,
        key,
      },
    });
  }
}
