import { Prisma, PrismaClient } from "@prisma/client";
import { supabaseServerClient } from "@supabase/auth-helpers-nextjs";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/utils/prisma";

export interface CtxUser {
  id: string;
  email: string;
}

export type Context = {
  req: NextApiRequest;
  res: NextApiResponse<any>;
  prisma: PrismaClient<
    Prisma.PrismaClientOptions,
    never,
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
  >;
  user?: CtxUser;
};

export type CreateContextProps = {
  req: NextApiRequest;
  res: NextApiResponse;
};

export type CreateContext = ({ req, res }: CreateContextProps) => Context;

export async function withUserCreateContext({ req, res }: CreateContextProps) {
  const supabase = supabaseServerClient({ req, res });
  const authentication = await supabase.auth.api.getUserByCookie(req, res);
  const authenticated = authentication.user;
  const user: CtxUser | undefined =
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
