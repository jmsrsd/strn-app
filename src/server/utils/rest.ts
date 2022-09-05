import { Context } from "./context";

type Input = {
  id?: string | null | undefined;
  value: any;
};

function withMetaData(props: { ctx: Context; input: Input }) {
  const { ctx, input } = props;
  const { id } = input;
  const value = input.value ?? {};
  const now = +Date.now();
  return {
    id,
    value: {
      ...value,
      createdBy: input.value.createdBy ?? ctx.user?.id,
      createdAt: input.value.createdAt ?? now,
      updatedBy: ctx.user?.id,
      updatedAt: now,
    },
  };
}

export async function get(props: { ctx: Context; input: { id: string } }) {
  const { ctx, input } = props;
  const id = input.id;
  return await ctx.prisma.data.findMany({ where: { id } });
}

export async function post(props: { ctx: Context; input: Input }) {
  const { value } = withMetaData(props);
  return await props.ctx.prisma.data.create({
    data: {
      value,
    },
  });
}

export async function put(props: {
  ctx: Context;
  input: { id: string; value: any };
}) {
  return await props.ctx.prisma.data.update({
    where: { id: props.input.id },
    data: { value: withMetaData(props).value },
  });
}

async function delete_(props: { ctx: Context; input: { id: string } }) {
  return await props.ctx.prisma.data.delete({
    where: { id: props.input.id },
  });
}

export { delete_ as delete };
