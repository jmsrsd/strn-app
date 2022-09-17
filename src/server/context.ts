import { Prisma, PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { DB } from "~/utils/db";
import { prisma } from "~/utils/prisma";
import * as supabase from "~/utils/supabase";
import { getUserRole, StrictUser } from "~/utils/user";

export type Context = {
  req: NextApiRequest;
  res: NextApiResponse<any>;
  prisma: PrismaClient<
    Prisma.PrismaClientOptions,
    never,
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
  >;
  db: typeof DB;
  user?: StrictUser;
};

export type CreateContextProps = {
  req: NextApiRequest;
  res: NextApiResponse;
};

export type CreateContext = (props: CreateContextProps) => Context;

export async function getCreateContext(
  props: CreateContextProps,
): Promise<CreateContext> {
  const auth = await supabase.auth(props);
  const { id, email } = auth.user ?? {};
  const authenticated = !!id && !!email;
  const user: StrictUser | undefined = authenticated
    ? {
      id: id!,
      email: email!,
      role: await getUserRole(props),
    }
    : undefined;

  return ({ req, res }) => {
    return { req, res, prisma, db: DB, user };
  };
}
