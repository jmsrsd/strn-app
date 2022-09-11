import { Nullish } from "~/utils/nullish";
import { Context } from "./context";

export type DatabaseWhereQuery = {
  where: {
    applicationKey: string;
    domainKey: string;
    entityId: string;
    attributeKey: string;
  };
};

export type DatabasePointerQuery = {
  pointer: string[];
};

export class Database {
  readonly ctx: Context;

  constructor(ctx: Context) {
    this.ctx = ctx;
  }

  application(key: string) {
    return new Application(this, key);
  }

  async attribute(query: DatabaseWhereQuery) {
    const { applicationKey, domainKey, entityId, attributeKey } = query.where;
    const application = this.application(applicationKey);
    const domain = application.domain(domainKey);
    const entity = await domain.entity(entityId).ensure();
    return entity.attribute(attributeKey);
  }

  get orm() {
    const { prisma } = this.ctx;
    return {
      application: prisma.strn_application,
      attribute: prisma.strn_attribute,
      domain: prisma.strn_domain,
      entity: prisma.strn_entity,
      file: prisma.strn_file,
      text: prisma.strn_text,
    };
  }

  async text(query: DatabaseWhereQuery) {
    const attribute = await this.attribute(query);
    return await attribute.text.get();
  }

  async numeric(query: DatabaseWhereQuery) {
    return await this.text(query).then((text) => +text || 0);
  }

  async set(value: string | number, query: DatabaseWhereQuery) {
    const attribute = await this.attribute(query);
    await attribute.text.set(`${value}`);
  }

  async download(query: DatabaseWhereQuery) {
    const attribute = await this.attribute(query);
    return await attribute.file.get();
  }

  async upload(value: Buffer, query: DatabaseWhereQuery) {
    const attribute = await this.attribute(query);
    await attribute.file.set(value);
  }

  async drop(query: DatabasePointerQuery) {
    const nullishPointer: (string | Nullish)[] = [...query.pointer];
    const pointer = { ...nullishPointer };
    const attribute = this.application(pointer[0] ?? "")
      .domain(pointer[1] ?? "")
      .entity(pointer[2] ?? "")
      .attribute(pointer[3] ?? "");
    const drops = [
      attribute.entity.domain.application.drop,
      attribute.entity.domain.drop,
      attribute.entity.drop,
      attribute.drop,
    ];
    const dropAt = query.pointer.length - 1;
    await Promise.all(
      drops
        .filter((_, index) => index === dropAt)
        .map(async (drop) => await drop())
    );
  }
}

export class Application {
  readonly database: Database;
  readonly key: string;

  constructor(database: Database, key: string) {
    this.database = database;
    this.key = key;
  }

  async id() {
    const select = { id: true };
    const where = { key: this.key };
    const data = where;
    const id = await this.database.orm.application
      .findFirst({
        select,
        where,
      })
      .then((found) => found?.id);
    if (!!id) return id;
    return await this.database.orm.application
      .create({
        select,
        data,
      })
      .then((created) => created.id);
  }

  domain(key: string) {
    return new Domain(this, key);
  }

  async domains() {
    return await this.database.orm.domain
      .findMany({
        select: { key: true },
        where: { application_id: await this.id() },
      })
      .then((found) => {
        const keys = found.map(({ key }) => key);
        return keys.map((key) => this.domain(key));
      });
  }

  async drop() {
    const domains = await this.domains();
    for (const domain of domains) {
      await domain.drop();
    }
    await this.database.orm.application.deleteMany({
      where: { id: await this.id() },
    });
  }
}

export class Domain {
  readonly application: Application;
  readonly key: string;

  constructor(application: Application, key: string) {
    this.application = application;
    this.key = key;
  }

  get database() {
    return this.application.database;
  }

  async id() {
    const select = { id: true };
    const where = {
      application_id: await this.application.id(),
      key: this.key,
    };
    const data = where;
    const id = await this.database.orm.domain
      .findFirst({
        select,
        where,
      })
      .then((found) => found?.id);
    if (!!id) return id;
    return await this.database.orm.domain
      .create({
        select,
        data,
      })
      .then((created) => created.id);
  }

  entity(id: string) {
    return new Entity(this, id);
  }

  async entities() {
    return await this.database.orm.entity
      .findMany({
        select: { id: true },
        where: { domain_id: await this.id() },
      })
      .then((found) => {
        const ids = found.map(({ id }) => id);
        return ids.map((id) => this.entity(id));
      });
  }

  async drop() {
    const entities = await this.entities();
    for (const entity of entities) {
      await entity.drop();
    }
    await this.database.orm.domain.deleteMany({
      where: { id: await this.id() },
    });
  }
}

export class Entity {
  readonly domain: Domain;
  readonly id: string;

  constructor(domain: Domain, id: string) {
    this.domain = domain;
    this.id = id;
  }

  get database() {
    return this.domain.database;
  }

  async ensure() {
    const select = { id: true };
    const where = {
      domain_id: await this.domain.id(),
    };
    const data = where;
    const id = await this.database.orm.entity
      .findFirst({
        select,
        where,
      })
      .then((found) => found?.id);
    if (!!id) return this;
    await this.database.orm.entity.create({
      select,
      data,
    });
    return this;
  }

  attribute(key: string) {
    return new Attribute(this, key);
  }

  async attributes() {
    return await this.database.orm.attribute
      .findMany({
        select: { key: true },
        where: { entity_id: this.id },
      })
      .then((found) => {
        const keys = found.map(({ key }) => key);
        return keys.map((key) => this.attribute(key));
      });
  }

  async drop() {
    const attributes = await this.attributes();
    for (const attribute of attributes) {
      await attribute.drop();
    }
    await this.database.orm.entity.deleteMany({
      where: { id: this.id },
    });
  }
}

export class Attribute {
  readonly entity: Entity;
  readonly key: string;

  constructor(entity: Entity, key: string) {
    this.entity = entity;
    this.key = key;
  }

  get database() {
    return this.entity.database;
  }

  async id() {
    const entity = await this.entity.ensure();
    const select = { id: true };
    const where = {
      entity_id: entity.id,
      key: this.key,
    };
    const data = where;
    const id = await this.database.orm.attribute
      .findFirst({
        select,
        where,
      })
      .then((found) => found?.id);
    if (!!id) return id;
    return await this.database.orm.attribute
      .create({
        select,
        data,
      })
      .then((created) => created.id);
  }

  get text() {
    return new Text(this);
  }

  get file() {
    return new File(this);
  }

  async drop() {
    const drops = [this.text.drop, this.file.drop];
    await Promise.all(drops.map(async (drop) => await drop()));
    await this.database.orm.attribute.deleteMany({
      where: { id: await this.id() },
    });
  }
}

export class Text {
  readonly attribute: Attribute;

  constructor(attribute: Attribute) {
    this.attribute = attribute;
  }

  get database() {
    return this.attribute.database;
  }

  async id() {
    const select = { id: true };
    const where = {
      attribute_id: await this.attribute.id(),
    };
    const id = await this.database.orm.text
      .findFirst({
        select,
        where,
      })
      .then((found) => found?.id);
    if (!!id) return id;
    return await this.database.orm.text
      .create({
        select,
        data: {
          ...where,
          value: "",
        },
      })
      .then((created) => created.id);
  }

  async get() {
    const id = await this.id();
    return this.database.orm.text
      .findFirst({
        select: { value: true },
        where: { id },
      })
      .then((found) => found?.value ?? "");
  }

  async set(value: string) {
    await this.database.orm.text.update({
      select: null,
      where: { id: await this.id() },
      data: { value },
    });
  }

  async drop() {
    await this.database.orm.text.deleteMany({
      where: { id: await this.id() },
    });
  }
}

export class File {
  readonly attribute: Attribute;

  constructor(attribute: Attribute) {
    this.attribute = attribute;
  }

  get database() {
    return this.attribute.database;
  }

  async id() {
    const select = { id: true };
    const where = {
      attribute_id: await this.attribute.id(),
    };
    const id = await this.database.orm.file
      .findFirst({
        select,
        where,
      })
      .then((found) => found?.id);
    if (!!id) return id;
    return await this.database.orm.file
      .create({
        select,
        data: {
          ...where,
          value: Buffer.from(Uint8Array.from([])),
        },
      })
      .then((created) => created.id);
  }

  async get() {
    const id = await this.id();
    return this.database.orm.file
      .findFirst({
        select: { value: true },
        where: { id },
      })
      .then((found) => {
        return found?.value ?? Buffer.from(Uint8Array.from([]));
      });
  }

  async set(value: Buffer) {
    await this.database.orm.file.update({
      select: null,
      where: { id: await this.id() },
      data: { value },
    });
  }

  async drop() {
    await this.database.orm.file.deleteMany({
      where: { id: await this.id() },
    });
  }
}
