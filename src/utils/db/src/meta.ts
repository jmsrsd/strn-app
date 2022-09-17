import { Application, Attribute, Domain, Entity } from "..";

export const Meta = async (application?: string, domain?: string, id?: string, key?: string) => {
  const app = await Application(`${application}`);
  const dom = await Domain(app.id, `${domain}`);
  const ent = await Entity(dom.id, `${id}`);
  const att = await Attribute(ent.id, `${key}`);
  return { application: app, domain: dom, entity: ent, attribute: att };
};
