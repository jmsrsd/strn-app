import { Context } from "../context";
import { Application } from "./application";

export class Domain {
  private ctx: Context;

  private constructor(ctx: Context) {
    this.ctx = ctx;
  }

  static of(ctx: Context) {
    return new Domain(ctx);
  }

  private get database() {
    return this.ctx.prisma.strn__domain;
  }

  private get application() {
    return Application.of(this.ctx);
  }

  async id(applicationKey: string, key: string) {
    const applicationId = await this.application.id(applicationKey);
    const id = await this.database
      .findFirst({
        select: {
          id: true,
        },
        where: {
          applicationId,
          key,
        },
      })
      .then((domain) => domain?.id);
    if (!!id) return id;
    return await this.database
      .create({
        select: {
          id: true,
        },
        data: {
          applicationId,
          key,
        },
      })
      .then((domain) => domain.id);
  }

  async keys(applicationKey: string) {
    const applicationId = await this.application.id(applicationKey);
    return await this.database
      .findMany({
        select: {
          key: true,
        },
        where: {
          applicationId,
        },
        orderBy: {
          key: "asc",
        },
      })
      .then((domains) => {
        return domains.map((domain) => domain.key);
      });
  }

  async count(applicationKey: string) {
    const applicationId = await this.application.id(applicationKey);
    return await this.database.count({
      where: {
        applicationId,
      },
    });
  }

  async remove(applicationKey: string, key: string) {
    const applicationId = await this.application.id(applicationKey);
    await this.database.deleteMany({
      where: {
        applicationId,
        key,
      },
    });
  }
}
