import { prisma } from "~/utils/prisma";
import { Document, File, Meta, Numeric, Text } from ".";

export const Data = (args: { application: string; domain: string; id: string; key: string }) => {
  const attribute = {
    id: async () => {
      const { application, domain, id, key } = args;
      const meta = await Meta(application, domain, id, key);
      return meta.attribute.id;
    },
  };
  return {
    text: async (value?: string) => {
      if (!value) return await Text(args);
      const orm = prisma.strn_text;
      const attribute_id = await attribute.id();
      const found = await orm.findFirst({ select: { id: true }, where: { attribute_id } });
      await orm.upsert({
        select: { id: true },
        where: { id: found?.id },
        update: { value },
        create: { attribute_id, value },
      });
    },
    numeric: async (value?: number) => {
      if (!value) return await Numeric(args);
      const orm = prisma.strn_numeric;
      const attribute_id = await attribute.id();
      const found = await orm.findFirst({ select: { id: true }, where: { attribute_id } });
      await orm.upsert({
        select: { id: true },
        where: { id: found?.id },
        update: { value },
        create: { attribute_id, value },
      });
    },
    document: async (value?: string) => {
      if (!value) return await Document(args);
      const orm = prisma.strn_document;
      const attribute_id = await attribute.id();
      const found = await orm.findFirst({ select: { id: true }, where: { attribute_id } });
      await orm.upsert({
        select: { id: true },
        where: { id: found?.id },
        update: { value },
        create: { attribute_id, value },
      });
    },
    file: async (value?: number[]) => {
      if (!value) return await File(args);
      const orm = prisma.strn_file;
      const attribute_id = await attribute.id();
      const found = await orm.findFirst({ select: { id: true }, where: { attribute_id } });
      const buffer = Buffer.from(Uint8Array.from(value));
      await orm.upsert({
        select: { id: true },
        where: { id: found?.id },
        update: { value: buffer },
        create: { attribute_id, value: buffer },
      });
    },
  };
};
