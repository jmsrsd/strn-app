import { Prisma, PrismaClient } from "@prisma/client";
import {
  supabaseServerClient,
  withApiAuth,
} from "@supabase/auth-helpers-nextjs";
import { SupabaseAuthClient } from "@supabase/supabase-js/dist/module/lib/SupabaseAuthClient";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/utils/prisma";
import waitFor from "~/utils/waitFor";

interface ContextUser {
  id: string;
  email: string;
}

type CreateContextProps = {
  req: NextApiRequest;
  res: NextApiResponse;
};

type CreateContext = ({ req, res }: CreateContextProps) => {
  req: NextApiRequest;
  res: NextApiResponse<any>;
  prisma: PrismaClient<
    Prisma.PrismaClientOptions,
    never,
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
  >;
  user: ContextUser;
};

async function authenticate(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<ContextUser> {
  let auth: SupabaseAuthClient | null | undefined;
  let isAuthenticating = true;

  await withApiAuth(async (req, res) => {
    auth = supabaseServerClient({ req, res }).auth;
    isAuthenticating = false;
  })(req, res);

  while (isAuthenticating) await waitFor(0);

  const user = auth?.user();
  return {
    id: `${user?.id}`,
    email: `${user?.email}`,
  };
}

export async function createContextWithApiAuth(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<CreateContext> {
  const user = await authenticate(req, res);
  return ({ req, res }) => {
    return { req, res, prisma, user };
  };
}

export type Context = ReturnType<CreateContext>;
