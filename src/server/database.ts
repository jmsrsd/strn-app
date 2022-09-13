import { Nullish } from "~/utils/types";
import { Context } from "./context";

export type DatabaseId = string;

export type DatabaseKey = string;

export type DatabaseSetType = "text" | "document" | "numeric";

export type DatabaseSetValue = string | number;

export type DatabaseRow = {
  applicationKey: DatabaseKey;
  domainKey: DatabaseKey;
  entityId: DatabaseId;
  attributeKey: DatabaseKey;
};

export type DatabaseWhereQuery = {
  where: DatabaseRow;
};

export type DatabasePointerQuery = {
  pointer: string[];
};

export interface DatabaseDroppable {
  drop(): Promise<void>;
}

export class Database {
  readonly ctx: Context;

  constructor(ctx: Context) {
    this.ctx = ctx;
  }

  application(key: DatabaseKey) {
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
      domain: prisma.strn_domain,
      entity: prisma.strn_entity,
      attribute: prisma.strn_attribute,
      text: prisma.strn_text,
      numeric: prisma.strn_numeric,
      document: prisma.strn_document,
      file: prisma.strn_file,
    };
  }

  async text(query: DatabaseWhereQuery) {
    const attribute = await this.attribute(query);
    return await attribute.text.get();
  }

  async document(query: DatabaseWhereQuery) {
    const attribute = await this.attribute(query);
    return await attribute.document.get();
  }

  async numeric(query: DatabaseWhereQuery) {
    const attribute = await this.attribute(query);
    return await attribute.numeric.get();
  }

  async set(type: DatabaseSetType, value: DatabaseSetValue, query: DatabaseWhereQuery) {
    const attribute = await this.attribute(query);
    switch (type) {
      case "text":
        return await attribute.text.set(`${value}`);
      case "numeric":
        return await attribute.numeric.set(+value);
      case "document":
        return await attribute.document.set(`${value}`);
    }
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
    const droppables: DatabaseDroppable[] = [
      attribute.entity.domain.application,
      attribute.entity.domain,
      attribute.entity,
      attribute,
    ];
    const dropAt = query.pointer.length - 1;
    await Promise.all(
      droppables
        .filter((_, index) => index === dropAt)
        .map(async (droppable) => await droppable.drop()),
    );
  }

  async find(
    mode: "first" | "many",
    application: string,
    domain: string,
    key: DatabaseSetType,
    where: {
      equals?: string | number;
      in?: string | number | (string | number)[];
      notIn?: string | number | (string | number)[];
      lt?: string | number;
      lte?: string | number;
      gt?: string | number;
      gte?: string | number;
      contains?: string;
      startsWith?: string;
      endsWith?: string;
      not?: number;
    },
    take: number | undefined,
    skip: number | undefined,
  ) {
    const { equals, in: in_, notIn, lt, lte, gt, gte, contains, startsWith, endsWith, not } = where;
    const stringWhere = {
      equals: equals as string | undefined,
      in: in_ as string | string[] | undefined,
      notIn: notIn as string | string[] | undefined,
      lt: lt as string | undefined,
      lte: lte as string | undefined,
      gt: gt as string | undefined,
      gte: gte as string | undefined,
      contains,
      startsWith,
      endsWith,
    };
    const stringQuery = {
      select: { attribute_id: true },
      where: {
        value: stringWhere,
      },
      take,
      skip,
    };
    const numberQuery = {
      select: { attribute_id: true },
      where: {
        value: {
          equals: equals as number | undefined,
          in: in_ as number | number[] | undefined,
          notIn: notIn as number | number[] | undefined,
          lt: lt as number | undefined,
          lte: lte as number | undefined,
          gt: gt as number | undefined,
          gte: gte as number | undefined,
          not,
        },
      },
      take,
      skip,
    };
    let attribute_ids: string[] | null | undefined = [];
    switch (key) {
      case "text": {
        const text = this.orm.text;
        if (mode == "many") {
          attribute_ids = await text.findMany(stringQuery).then((founds) => founds.map((found) => found.attribute_id));
        } else {
          attribute_ids.push(`${await text.findFirst(stringQuery).then((found) => found?.attribute_id)}`);
        }
        break;
      }
      case "numeric": {
        const numeric = this.orm.numeric;
        if (mode == "many") {
          attribute_ids = await numeric.findMany(numberQuery).then((founds) =>
            founds.map((found) => found.attribute_id)
          );
        } else {
          attribute_ids.push(`${await numeric.findFirst(numberQuery).then((found) => found?.attribute_id)}`);
        }
        break;
      }
      case "document": {
        const document = this.orm.document;
        if (mode == "many") {
          attribute_ids = await document.findMany(stringQuery).then((founds) =>
            founds.map((found) => found.attribute_id)
          );
        } else {
          attribute_ids.push(`${await document.findFirst(stringQuery).then((found) => found?.attribute_id)}`);
        }
        break;
      }
    }

    if (!attribute_ids) return [] as string[];

    const selected = await Promise.all(attribute_ids.map(async (attribute_id) => {
      return await this.orm.attribute.findMany({
        select: { entity_id: true },
        where: { id: `${attribute_id}` },
      }).then((founds) => founds.map((found) => found.entity_id));
    })).then((selected) => selected.reduce((p, c) => [...p, ...c]));

    return await this.application(application).domain(domain).entities().then((entities) => {
      return entities.map((entity) => entity.id).filter((id) => selected.includes(id));
    });
  }
}

export class Application implements DatabaseDroppable {
  readonly database: Database;
  readonly key: DatabaseKey;

  constructor(database: Database, key: DatabaseKey) {
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

  domain(key: DatabaseKey) {
    return new Domain(this, key);
  }

  async domains() {
    return await this.database.orm.domain
      .findMany({
        select: { key: true },
        where: { application_id: await this.id() },
        orderBy: { "id": "desc" },
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

export class Domain implements DatabaseDroppable {
  readonly application: Application;
  readonly key: DatabaseKey;

  constructor(application: Application, key: DatabaseKey) {
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

  entity(id: DatabaseId) {
    return new Entity(this, id);
  }

  async entities() {
    return await this.database.orm.entity
      .findMany({
        select: { id: true },
        where: { domain_id: await this.id() },
        orderBy: { "id": "desc" },
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

export class Entity implements DatabaseDroppable {
  readonly domain: Domain;
  readonly id: DatabaseId;

  constructor(domain: Domain, id: DatabaseId) {
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

  attribute(key: DatabaseKey) {
    return new Attribute(this, key);
  }

  async attributes() {
    return await this.database.orm.attribute
      .findMany({
        select: { key: true },
        where: { entity_id: this.id },
        orderBy: { "id": "desc" },
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

export class Attribute implements DatabaseDroppable {
  readonly entity: Entity;
  readonly key: DatabaseKey;

  constructor(entity: Entity, key: DatabaseKey) {
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

  get numeric() {
    return new Numeric(this);
  }

  get document() {
    return new Document(this);
  }

  get file() {
    return new File(this);
  }

  async drop() {
    const droppables: DatabaseDroppable[] = [this.text, this.numeric, this.document, this.file];
    await Promise.all(droppables.map(async (droppable) => await droppable.drop()));
    await this.database.orm.attribute.deleteMany({
      where: { id: await this.id() },
    });
  }
}

export class Text implements DatabaseDroppable {
  readonly attribute: Attribute;

  constructor(attribute: Attribute) {
    this.attribute = attribute;
  }

  get database() {
    return this.attribute.database;
  }

  get text() {
    return this.database.orm.text;
  }

  async id() {
    const select = { id: true };
    const where = {
      attribute_id: await this.attribute.id(),
    };
    const id = await this.text
      .findFirst({
        select,
        where,
      })
      .then((found) => found?.id);
    if (!!id) return id;
    return await this.text
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
    return this.text
      .findFirst({
        select: { value: true },
        where: { id },
      })
      .then((found) => found?.value ?? "");
  }

  async set(value: string) {
    await this.text.update({
      select: null,
      where: { id: await this.id() },
      data: { value },
    });
  }

  async drop() {
    await this.text.deleteMany({
      where: { id: await this.id() },
    });
  }
}

export class Numeric implements DatabaseDroppable {
  readonly attribute: Attribute;

  constructor(attribute: Attribute) {
    this.attribute = attribute;
  }

  get database() {
    return this.attribute.database;
  }

  get numeric() {
    return this.database.orm.numeric;
  }

  async id() {
    const select = { id: true };
    const where = {
      attribute_id: await this.attribute.id(),
    };
    const id = await this.numeric
      .findFirst({
        select,
        where,
      })
      .then((found) => found?.id);
    if (!!id) return id;
    return await this.numeric
      .create({
        select,
        data: {
          ...where,
          value: 0,
        },
      })
      .then((created) => created.id);
  }

  async get() {
    const id = await this.id();
    return this.numeric
      .findFirst({
        select: { value: true },
        where: { id },
      })
      .then((found) => found?.value ?? 0);
  }

  async set(value: number) {
    await this.numeric.update({
      select: null,
      where: { id: await this.id() },
      data: { value },
    });
  }

  async drop() {
    await this.numeric.deleteMany({
      where: { id: await this.id() },
    });
  }
}

export class Document implements DatabaseDroppable {
  readonly attribute: Attribute;

  constructor(attribute: Attribute) {
    this.attribute = attribute;
  }

  get database() {
    return this.attribute.database;
  }

  get document() {
    return this.database.orm.document;
  }

  async id() {
    const select = { id: true };
    const where = {
      attribute_id: await this.attribute.id(),
    };
    const id = await this.document
      .findFirst({
        select,
        where,
      })
      .then((found) => found?.id);
    if (!!id) return id;
    return await this.document
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
    return this.document
      .findFirst({
        select: { value: true },
        where: { id },
      })
      .then((found) => found?.value ?? "");
  }

  async set(value: string) {
    await this.document.update({
      select: null,
      where: { id: await this.id() },
      data: { value },
    });
  }

  async drop() {
    await this.document.deleteMany({
      where: { id: await this.id() },
    });
  }
}

export class File implements DatabaseDroppable {
  readonly attribute: Attribute;

  constructor(attribute: Attribute) {
    this.attribute = attribute;
  }

  get database() {
    return this.attribute.database;
  }

  get file() {
    return this.database.orm.file;
  }

  async id() {
    const select = { id: true };
    const where = {
      attribute_id: await this.attribute.id(),
    };
    const data = {
      ...where,
      value: Buffer.from(Uint8Array.from([])),
    };
    const found = await this.file.findFirst({ select, where });
    const id = found?.id;
    if (!!id) return id;
    const created = await this.file.create({ select, data });
    return created.id;
  }

  async get() {
    const id = await this.id();
    const select = { value: true };
    const where = { id };
    return this.file
      .findFirst({ select, where })
      .then((found) => {
        return found?.value;
      }).then((value) => {
        return value ?? Buffer.from(Uint8Array.from([]));
      });
  }

  async set(value: Buffer) {
    const id = await this.id();
    await this.file.update({
      select: null,
      where: { id },
      data: { value },
    });
  }

  async drop() {
    const id = await this.id();
    await this.file.deleteMany({
      where: { id },
    });
  }
}
