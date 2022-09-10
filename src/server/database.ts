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
    const length = query.pointer.length;
    const weakPointer: (string | Nullish)[] = [...query.pointer];
    const pointer = { ...weakPointer };
    const application = this.application(pointer[0] ?? "");
    const domain = application.domain(pointer[1] ?? "");
    const entity = domain.entity(pointer[2] ?? "");
    const attribute = entity.attribute(pointer[3] ?? "");
    switch (length) {
      case 1:
        return await application.drop();
      case 2:
        return await domain.drop();
      case 3:
        return await entity.drop();
      case 4:
        return await attribute.drop();
      default:
        return;
    }
  }
}

export class Application {
  readonly database: Database;
  readonly key: string;

  constructor(database: Database, key: string) {
    this.database = database;
    this.key = key;
  }

  get orm() {
    return this.database.orm;
  }

  async id() {
    const select = { id: true };
    const where = { key: this.key };
    const data = where;
    const id = await this.orm.application
      .findFirst({
        select,
        where,
      })
      .then((found) => found?.id);
    if (!!id) return id;
    return await this.orm.application
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
    return await this.orm.domain
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
    await this.orm.application.deleteMany({
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

  get orm() {
    return this.application.orm;
  }

  async id() {
    const select = { id: true };
    const where = {
      application_id: await this.application.id(),
      key: this.key,
    };
    const data = where;
    const id = await this.orm.domain
      .findFirst({
        select,
        where,
      })
      .then((found) => found?.id);
    if (!!id) return id;
    return await this.orm.domain
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
    return await this.orm.entity
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
    await this.orm.domain.deleteMany({
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

  get orm() {
    return this.domain.orm;
  }

  async ensure() {
    const select = { id: true };
    const where = {
      domain_id: await this.domain.id(),
    };
    const data = where;
    const id = await this.orm.entity
      .findFirst({
        select,
        where,
      })
      .then((found) => found?.id);
    if (!!id) return this;
    await this.orm.entity.create({
      select,
      data,
    });
    return this;
  }

  attribute(key: string) {
    return new Attribute(this, key);
  }

  async attributes() {
    return await this.orm.attribute
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
    await this.orm.entity.deleteMany({
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

  get orm() {
    return this.entity.orm;
  }

  async id() {
    const entity = await this.entity.ensure();
    const select = { id: true };
    const where = {
      entity_id: entity.id,
      key: this.key,
    };
    const data = where;
    const id = await this.orm.attribute
      .findFirst({
        select,
        where,
      })
      .then((found) => found?.id);
    if (!!id) return id;
    return await this.orm.attribute
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
    await this.text.drop();
    await this.file.drop();
    await this.orm.attribute.deleteMany({
      where: { id: await this.id() },
    });
  }
}

export class Text {
  readonly attribute: Attribute;

  constructor(attribute: Attribute) {
    this.attribute = attribute;
  }

  get orm() {
    return this.attribute.orm;
  }

  async id() {
    const select = { id: true };
    const where = {
      attribute_id: await this.attribute.id(),
    };
    const id = await this.orm.text
      .findFirst({
        select,
        where,
      })
      .then((found) => found?.id);
    if (!!id) return id;
    return await this.orm.text
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
    return this.orm.text
      .findFirst({
        select: { value: true },
        where: { id },
      })
      .then((found) => found?.value ?? "");
  }

  async set(value: string) {
    await this.orm.text.update({
      select: null,
      where: { id: await this.id() },
      data: { value },
    });
  }

  async drop() {
    await this.orm.text.deleteMany({
      where: { id: await this.id() },
    });
  }
}

export class File {
  readonly attribute: Attribute;

  constructor(attribute: Attribute) {
    this.attribute = attribute;
  }

  get orm() {
    return this.attribute.orm;
  }

  async id() {
    const select = { id: true };
    const where = {
      attribute_id: await this.attribute.id(),
    };
    const id = await this.orm.file
      .findFirst({
        select,
        where,
      })
      .then((found) => found?.id);
    if (!!id) return id;
    return await this.orm.file
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
    return this.orm.file
      .findFirst({
        select: { value: true },
        where: { id },
      })
      .then((found) => {
        return found?.value ?? Buffer.from(Uint8Array.from([]));
      });
  }

  async set(value: Buffer) {
    await this.orm.file.update({
      select: null,
      where: { id: await this.id() },
      data: { value },
    });
  }

  async drop() {
    await this.orm.file.deleteMany({
      where: { id: await this.id() },
    });
  }
}
