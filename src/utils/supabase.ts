import { supabaseServerClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";
import { NextApiRequest, NextApiResponse } from "next";

export type NextApiMethods = {
  req: NextApiRequest;
  res: NextApiResponse;
};

export const service = () => {
  return createClient(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}`,
    `${process.env.SUPABASE_SERVICE_KEY}`
  );
};

export const client = (nextApiMethods: NextApiMethods) => {
  return supabaseServerClient(nextApiMethods);
};

export const auth = (nextApiMethods: NextApiMethods) => {
  const { req, res } = nextApiMethods;
  return client(nextApiMethods).auth.api.getUserByCookie(req, res);
};
