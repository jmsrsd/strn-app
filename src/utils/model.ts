import { z } from "zod";
import { Query } from "~/utils/db";
import { FloatFilter, StringFilter } from "~/utils/prisma";
import { trpc } from "~/utils/trpc";

export const ModelFindSchema = <T>(args: { where: z.ZodType<T> }) => (z.object({
  domain: z.string(),
  key: z.string(),
  where: args.where,
}));

export const ModelQuerySchema = z.object({
  domain: z.string(),
  opts: z.object({
    skip: z.number().optional(),
    take: z.number().optional(),
    order: z.literal("asc").or(z.literal("desc")).optional(),
  }).optional(),
});

type InferCreateModelAttributeBuilderOutput<T> = T extends
  <TDomain extends string>(args: { domain: TDomain; id: string }) => infer TOutput ? TOutput
  : never;

type ModelAttributeBuilder = InferCreateModelAttributeBuilderOutput<typeof createModelAttributeBuilder>;

const createModelAttributeBuilder = <TDomain extends string>(args: { domain: TDomain; id: string }) => {
  const { domain, id } = args;
  return <TKey extends string>(key: TKey) => {
    const find = {
      text: (where: StringFilter | string) => trpc.useQuery(["model.find.text", { domain, key, where }]),
      document: (where: StringFilter | string) => trpc.useQuery(["model.find.document", { domain, key, where }]),
      numeric: (where: FloatFilter | number) => trpc.useQuery(["model.find.numeric", { domain, key, where }]),
    };

    const get = {
      text: () => trpc.useQuery(["model.text.get", { domain, id, key }]),
      document: () => trpc.useQuery(["model.document.get", { domain, id, key }]),
      numeric: () => trpc.useQuery(["model.numeric.get", { domain, id, key }]),
      file: () => trpc.useQuery(["model.file.get", { domain, id, key }]),
    };

    const set = {
      text: async () => {
        const set = trpc.useMutation(["model.text.set"]);
        const mutate = (value: string) => set.mutate({ domain, id, key, value });
        const mutateAsync = async (value: string) => await set.mutateAsync({ domain, id, key, value });
        return { ...set, mutate, mutateAsync };
      },
      document: async () => {
        const set = trpc.useMutation(["model.document.set"]);
        const mutate = (value: string) => set.mutate({ domain, id, key, value });
        const mutateAsync = async (value: string) => await set.mutateAsync({ domain, id, key, value });
        return { ...set, mutate, mutateAsync };
      },
      numeric: async () => {
        const set = trpc.useMutation(["model.numeric.set"]);
        const mutate = (value: number) => set.mutate({ domain, id, key, value });
        const mutateAsync = async (value: number) => await set.mutateAsync({ domain, id, key, value });
        return { ...set, mutate, mutateAsync };
      },
      file: async () => {
        const set = trpc.useMutation(["model.file.set"]);
        const mutate = (value: number[]) => set.mutate({ domain, id, key, value });
        const mutateAsync = async (value: number[]) => await set.mutateAsync({ domain, id, key, value });
        return { ...set, mutate, mutateAsync };
      },
    };

    const drop = {
      text: () => {
        const drop = trpc.useMutation(["model.text.drop"]);
        const mutate = () => drop.mutate({ domain, id, key });
        const mutateAsync = async () => await drop.mutateAsync({ domain, id, key });
        return { ...drop, mutate, mutateAsync };
      },
      document: () => {
        const drop = trpc.useMutation(["model.document.drop"]);
        const mutate = () => drop.mutate({ domain, id, key });
        const mutateAsync = async () => await drop.mutateAsync({ domain, id, key });
        return { ...drop, mutate, mutateAsync };
      },
      numeric: () => {
        const drop = trpc.useMutation(["model.numeric.drop"]);
        const mutate = () => drop.mutate({ domain, id, key });
        const mutateAsync = async () => await drop.mutateAsync({ domain, id, key });
        return { ...drop, mutate, mutateAsync };
      },
      file: () => {
        const drop = trpc.useMutation(["model.file.drop"]);
        const mutate = () => drop.mutate({ domain, id, key });
        const mutateAsync = async () => await drop.mutateAsync({ domain, id, key });
        return { ...drop, mutate, mutateAsync };
      },
    };

    const Attribute = <TAttribute>(attribute: TAttribute) => {
      const entity: { [k in TKey]?: typeof attribute } = {};
      entity[key] = attribute;
      return entity;
    };

    return {
      text: Attribute({
        find: find.text,
        get: get.text,
        set: set.text,
        drop: drop.text,
      }),
      document: Attribute({
        find: find.document,
        get: get.document,
        set: set.document,
        drop: drop.document,
      }),
      numeric: Attribute({
        find: find.numeric,
        get: get.numeric,
        set: set.numeric,
        drop: drop.numeric,
      }),
      file: Attribute({
        get: get.file,
        set: set.file,
        drop: drop.file,
      }),
    };
  };
};

export const Model = <TDomain extends string, TAttributes>(
  domain: TDomain,
  attributes: ($: ModelAttributeBuilder) => TAttributes,
) => {
  const model = {
    browse: (opts?: Query) => trpc.useQuery(["model.browse", { domain, opts }]),
    count: (opts?: Query) => trpc.useQuery(["model.count", { domain, opts }]),
    id: (id: string) => {
      const builder = createModelAttributeBuilder({ domain, id });
      return attributes(builder);
    },
  };
  const result: { [k in TDomain]?: typeof model } = {};
  result[domain] = model;
  return result;
};
