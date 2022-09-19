import { Prisma } from '@prisma/client';
import { prisma } from '~/utils/prisma';

export type StrnWhere = { id: string } | { key: string };

export const app = async (where: StrnWhere) => {
  return await prisma.strnapp.findFirst({ where });
};

export const apps = async () => {
  const self = await prisma.strnapp.findMany();
  return await Promise.all(self.map(app));
};

export const collection = async (where: StrnWhere & { appid?: string }) => {
  const self = await prisma.strncollection.findFirst({ where });
  if (!self) return null;
  return {
    ...self,
    app: await app({ id: self.appid }),
  };
};

export const collections = async (appid?: string) => {
  if (!appid) return [];
  const self = await prisma.strncollection.findMany({ where: { appid } });
  return await Promise.all(self.map(collection));
};

export const document = async (
  where: { id?: string } & { collectionid?: string }
) => {
  const self = await prisma.strndocument.findFirst({ where });
  if (!self) return null;
  return {
    ...self,
    collection: await collection({ id: self.collectionid }),
  };
};

export const documents = async (collectionid?: string) => {
  if (!collectionid) return [];
  const self = await prisma.strndocument.findMany({ where: { collectionid } });
  return await Promise.all(self.map(document));
};

export const text = async (
  where: (
    | {
        id?: string;
      }
    | { key?: string }
  ) & { documentid?: string }
) => {
  const self = await prisma.strntext.findFirst({ where });
  if (!self) return null;
  return {
    ...self,
    document: await document({ id: self.documentid }),
  };
};

export const texts = async (value: string | Prisma.StringFilter) => {
  const self = await prisma.strntext.findMany({
    select: { documentid: true },
    where: { value },
  });
  return await Promise.all(
    self.map(async ({ documentid }) => {
      return await document({ id: documentid });
    })
  );
};

export const numeric = async (
  where: (
    | {
        id?: string;
      }
    | { key?: string }
  ) & { documentid?: string }
) => {
  const self = await prisma.strnnumeric.findFirst({ where });
  if (!self) return null;
  return {
    ...self,
    document: await document({ id: self.documentid }),
  };
};

export const numerics = async (value: number | Prisma.FloatFilter) => {
  const self = await prisma.strnnumeric.findMany({
    select: { documentid: true },
    where: { value },
  });
  return await Promise.all(
    self.map(async ({ documentid }) => {
      return await document({ id: documentid });
    })
  );
};

export const file = async (
  where: (
    | {
        id?: string;
      }
    | { key?: string }
  ) & { documentid?: string }
) => {
  const self = await prisma.strnfile.findFirst({ where });
  if (!self) return null;
  return {
    ...self,
    document: await document({ id: self.documentid }),
  };
};

export const files = async (value: Buffer | Prisma.BytesFilter) => {
  const self = await prisma.strnfile.findMany({
    select: { documentid: true },
    where: { value },
  });
  return await Promise.all(
    self.map(async ({ documentid }) => {
      return await document({ id: documentid });
    })
  );
};

export const App = () => ({
  create: async (key: string) => {
    return await prisma.strnapp.create({ data: { key } });
  },
  delete: async (id: string) => {
    const deleted = await prisma.strnapp.delete({ where: { id } });
    await Collection(deleted.key).deleteAll();
  },
});

export const Collection = (appkey: string) => {
  const _delete = async (id: string) => {
    const deleted = await prisma.strncollection.delete({ where: { id } });
    await Document(appkey, deleted.key).deleteAll();
  };

  return {
    create: async (key: string) => {
      const _app = await app({ key: appkey }).then(async (self) => {
        if (!!self) return self;
        return await App().create(appkey);
      });
      const selected = await collection({ key, appid: _app.id });
      if (!!selected) return selected;
      const created = await prisma.strncollection.create({
        data: { appid: _app.id, key },
      });
      return await collection(created);
    },
    delete: _delete,
    deleteAll: async () => {
      const _app = await app({ key: appkey });
      const _collections = await collections(_app?.id);
      await Promise.all(
        _collections.map(async (_collection) => {
          const id = _collection?.id;
          if (!id) return;
          await _delete(id);
        })
      );
    },
  };
};

export const Document = (appkey: string, collectionkey: string) => {
  const _delete = async (id: string) => {
    const deleted = await prisma.strndocument.delete({ where: { id } });
    await Promise.all([
      Text(deleted.id).deleteAll(),
      Numeric(deleted.id).deleteAll(),
      File(deleted.id).deleteAll(),
    ]);
  };

  return {
    create: async () => {
      const _app = await app({ key: appkey }).then(async (self) => {
        if (!!self) return self;
        return await App().create(appkey);
      });
      const _collection = await collection({
        appid: _app.id,
        key: collectionkey,
      }).then(async (self) => {
        if (!!self) return self;
        return await Collection(appkey).create(collectionkey);
      });
      if (!_collection) return null;
      const created = await prisma.strndocument.create({
        data: { collectionid: _collection.id },
      });
      return await document(created);
    },
    delete: _delete,
    deleteAll: async () => {
      const _app = await app({ key: appkey });
      const _collection = await collection({
        key: collectionkey,
        appid: _app?.id,
      });
      const _documents = await documents(_collection?.id);
      await Promise.all(
        _documents.map(async (_document) => {
          const id = _collection?.id;
          if (!id) return;
          await _delete(id);
        })
      );
    },
  };
};

export const Text = (documentid: string) => {
  return {
    get: async (key: string) => {
      return await text({ key, documentid });
    },
    set: async (key: string, value: string) => {
      try {
        const _document = await document({ id: documentid });
        if (!_document) return;
        await prisma.strntext.deleteMany({ where: { documentid } });
        await prisma.strntext.create({
          select: {},
          data: { documentid, key, value },
        });
      } catch (e) {
        console.error(e);
      }
    },
    deleteAll: async () => {
      const _texts = await prisma.strntext.findMany({
        select: { id: true },
        where: { documentid },
      });
      await Promise.all(
        _texts.map(async ({ id }) => {
          return await prisma.strntext.delete({ where: { id } });
        })
      );
    },
  };
};

export const Numeric = (documentid: string) => {
  return {
    get: async (key: string) => {
      return await numeric({ key, documentid });
    },
    set: async (key: string, value: number) => {
      try {
        const _document = await document({ id: documentid });
        if (!_document) return;
        await prisma.strnnumeric.deleteMany({ where: { documentid } });
        await prisma.strnnumeric.create({
          select: {},
          data: { documentid, key, value },
        });
      } catch (e) {
        console.error(e);
      }
    },
    deleteAll: async () => {
      const _numerics = await prisma.strnnumeric.findMany({
        select: { id: true },
        where: { documentid },
      });
      await Promise.all(
        _numerics.map(async ({ id }) => {
          return await prisma.strnnumeric.delete({ where: { id } });
        })
      );
    },
  };
};

export const File = (documentid: string) => {
  return {
    get: async (key: string) => {
      return await file({ key, documentid });
    },
    set: async (key: string, value: Buffer) => {
      try {
        const _document = await document({ id: documentid });
        if (!_document) return;
        await prisma.strnfile.deleteMany({ where: { documentid } });
        await prisma.strnfile.create({
          select: {},
          data: { documentid, key, value },
        });
      } catch (e) {
        console.error(e);
      }
    },
    deleteAll: async () => {
      const _files = await prisma.strnfile.findMany({
        select: { id: true },
        where: { documentid },
      });
      await Promise.all(
        _files.map(async ({ id }) => {
          return await prisma.strnfile.delete({ where: { id } });
        })
      );
    },
  };
};
