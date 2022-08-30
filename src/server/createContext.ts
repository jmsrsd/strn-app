import { Prisma, PrismaClient } from "@prisma/client";
import { supabaseServerClient } from "@supabase/auth-helpers-nextjs";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/utils/prisma";
import { User } from "~/utils/withUser";

export type Context = {
  req: NextApiRequest;
  res: NextApiResponse<any>;
  prisma: PrismaClient<
    Prisma.PrismaClientOptions,
    never,
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
  >;
  user?: User;
};

export type CreateContextProps = {
  req: NextApiRequest;
  res: NextApiResponse;
};

export type CreateContext = ({ req, res }: CreateContextProps) => Context;

export async function makeCreateContext({ req, res }: CreateContextProps) {
  const supabase = supabaseServerClient({ req, res });
  const authentication = await supabase.auth.api.getUserByCookie(req, res);
  const authenticated = authentication.user;
  const user: User | undefined =
    !!authenticated?.id && !!authenticated?.email
      ? {
          id: authenticated?.id,
          email: authenticated?.email,
        }
      : undefined;

  const result: CreateContext = ({ req, res }) => {
    return { req, res, prisma, user };
  };

  return result;
}
