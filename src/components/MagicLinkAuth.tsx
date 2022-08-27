import { supabaseClient } from "@supabase/auth-helpers-nextjs";
import { useUser } from "@supabase/auth-helpers-react";
import { UserState } from "@supabase/auth-helpers-shared";
import { Auth } from "@supabase/ui";
import { useEffect } from "react";

export default function MagicLinkAuth({ error }: any) {
  useEffect(() => {
    document
      .getElementById("auth-magic-link")
      ?.children[0]?.children[1]?.remove();
  });

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="max-w-xs mb-40 flex flex-col items-center">
        {error && <p>{error.message}</p>}
        <h1 className="text-lg">⚡ Supabase Authentication</h1>
        <Auth
          supabaseClient={supabaseClient}
          magicLink={true}
          view="magic_link"
        />
        <span className="flex flex-row items-center space-x-2 mt-8">
          <p>Powered by</p>
          <a href="https://supabase.com/">
            <img
              className="bg-gray-900 p-2 rounded-md h-8"
              alt="supabase"
              src="https://supabase.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fsupabase-logo-wordmark--dark.53d797e9.png&w=128&q=75"
            />
          </a>
        </span>
      </div>
    </div>
  );
}

export function withMagicLinkAuth(
  Component: (userState: UserState) => JSX.Element
) {
  const userState = useUser();
  if (!userState.user) return <MagicLinkAuth error={userState.error} />;
  return Component(userState);
}
