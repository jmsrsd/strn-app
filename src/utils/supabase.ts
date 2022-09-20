import { supabaseServerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';

import { env } from './env';
import { NextApiHandlerProps } from './next';

export const service = () => {
  return createClient(
    env("NEXT_PUBLIC_SUPABASE_URL"),
    env("SUPABASE_SERVICE_KEY")
  );
};

export const client = (props: NextApiHandlerProps) => {
  const { req, res } = props;
  return supabaseServerClient({ req, res });
};

export const auth = (props: NextApiHandlerProps) => {
  const { req, res } = props;
  return client({ req, res }).auth.api.getUserByCookie(req, res);
};
