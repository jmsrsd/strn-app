import { drop, Meta } from "..";

export const Drop = async (application?: string, domain?: string, id?: string, key?: string) => {
  const meta = await Meta(application, domain, id, key);

  if (!!key) {
    await drop.attribute(meta.attribute.id);
    return;
  }

  if (!!id) {
    await drop.attribute(meta.attribute.id);
    await drop.entity(meta.entity.id);
    return;
  }

  if (!!domain) {
    await drop.attribute(meta.attribute.id);
    await drop.entity(meta.entity.id);
    await drop.domain(meta.domain.id);
    return;
  }

  if (!!application) {
    await drop.attribute(meta.attribute.id);
    await drop.entity(meta.entity.id);
    await drop.domain(meta.domain.id);
    await drop.application(meta.application.id);
    return;
  }
};
