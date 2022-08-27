import { supabaseClient } from "@supabase/auth-helpers-nextjs";

export default function withSupabaseCookie(res: Response) {
  const session = supabaseClient.auth.session();
  res.headers.set(
    `Cookie`,
    [
      `sb-access-token=${session?.access_token}`,
      `sb-refresh-token=${session?.refresh_token}`,
    ].join(`; `)
  );
  return res;
}
