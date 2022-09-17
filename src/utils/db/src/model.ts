import { FloatFilter, StringFilter } from "~/utils/prisma";
import { DB, DocumentAttribute, FileAttribute, NumericAttribute, Query, TextAttribute } from "..";

export const ModelAttributes = (args: { application: string; domain: string; id: string }) => {
  return {
    text: <TKey extends string>(key: TKey) => TextAttribute<TKey>(key, args),
    numeric: <TKey extends string>(key: TKey) => NumericAttribute<TKey>(key, args),
    document: <TKey extends string>(key: TKey) => DocumentAttribute<TKey>(key, args),
    file: <TKey extends string>(key: TKey) => FileAttribute<TKey>(key, args),
  };
};

export const Model = <
  TApplication extends string,
  TDomain extends string,
  TAttributes,
  TOutput,
>(
  args: {
    application: TApplication;
    domain: TDomain;
    attributes: (attributes: TAttributes) => TOutput;
  },
  attributes: (args: { application: TApplication; domain: TDomain; id: string }) => TAttributes,
) => {
  const collection = DB.app(args.application).from(args.domain);
  const query = (opts?: Query) => {
    const { count, ids } = collection.query(opts);
    return { count, ids };
  };
  const model = {
    drop: collection.drop,
    browse: async (opts?: Query) => {
      const ids = await query(opts).ids();
      return ids.map((id) => {
        const model = Model(args, attributes)[args.domain];
        return model?.id(id);
      });
    },
    count: async (opts?: Query) => await query(opts).count(),
    find: (key: keyof TOutput) => {
      const find = collection.query().find(String(key));
      return {
        string: async (where: string | StringFilter) => {
          const entities = await Promise.all([
            find.text(where),
            find.document(where),
          ]);
          return entities.reduce((p, c) => {
            return [...p, ...c];
          }).map((entity) => {
            return entity.id;
          }).map((id) => {
            const model = Model(args, attributes)[args.domain];
            return model?.id(id);
          });
        },
        number: async (where: number | FloatFilter) => {
          const entities = await find.numeric(where);
          return entities.map((entity) => {
            return entity.id;
          }).map((id) => {
            const model = Model(args, attributes)[args.domain];
            return model?.id(id);
          });
        },
      };
    },
    id: (id: string) => ({
      meta: {
        application: args.application,
        domain: args.domain,
        id,
      },
      ...args.attributes(
        attributes({
          application: args.application,
          domain: args.domain,
          id,
        }),
      ),
    }),
  };
  const result: { [k in TDomain]?: typeof model } = {};
  result[args.domain] = model;
  return result;
};
