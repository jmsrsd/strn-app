import { Context } from "../context";
import { Domain } from "./domain";

export class Application {
  private ctx: Context;

  private constructor(ctx: Context) {
    this.ctx = ctx;
  }

  static of(ctx: Context) {
    return new Application(ctx);
  }

  private get database() {
    return this.ctx.prisma.strnApplication;
  }

  async id(key: string) {
    const id = await this.database
      .findFirst({
        select: {
          id: true,
        },
        where: {
          key,
        },
      })
      .then((application) => application?.id);
    if (!!id) return id;
    return await this.database
      .create({
        select: {
          id: true,
        },
        data: {
          key,
        },
      })
      .then((application) => application.id);
  }

  async keys() {
    return await this.database
      .findMany({
        select: {
          key: true,
        },
        orderBy: {
          key: "asc",
        },
      })
      .then((applications) => {
        return applications.map((application) => application.key);
      });
  }

  async count() {
    return await this.database.count();
  }

  async remove(key: string) {
    const domain = Domain.of(this.ctx);
    const domainKeys = await domain.keys(key);
    await Promise.all(
      domainKeys.map(async (domainKey) => {
        await domain.remove(key, domainKey);
      })
    );
    await this.database.deleteMany({
      where: {
        key,
      },
    });
  }
}
