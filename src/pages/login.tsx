import { supabaseClient } from "@supabase/auth-helpers-nextjs";
import { useUser } from "@supabase/auth-helpers-react";
import { Auth } from "@supabase/ui";
import { useEffect, useState } from "react";

const MagicLinkAuth = ({ error }: any) => {
  useEffect(() => {
    document
      .getElementById("auth-magic-link")
      ?.children[0]?.children[1]?.remove();
  });

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="max-w-xs mb-40 flex flex-col items-center space-y-8">
        {error && <p>{error.message}</p>}
        <Auth
          supabaseClient={supabaseClient}
          magicLink={true}
          view="magic_link"
        />
        <span className="flex flex-row items-center space-x-2">
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
};

const LoginPage = () => {
  const { user, error } = useUser();
  const [data, setData] = useState<any>();

  useEffect(() => {
    async function loadData() {
      const { data } = await supabaseClient.from("json").select("*");
      setData(data);
    }
    if (user) loadData();
  }, [user]);

  if (!user) return <MagicLinkAuth error={error} />;

  return (
    <div className="w-full min-h-screen">
      <div className="m-auto flex flex-col space-y-4">
        <button
          className="bg-gray-900 py-2 px-4 my-4 mx-auto rounded-md text-white font-bold"
          onClick={() => supabaseClient.auth.signOut()}
        >
          SIGN OUT
        </button>
        <p className="h-12 flex flex-row items-end justify-center">user</p>
        <pre>{JSON.stringify({ id: user.id, email: user.email }, null, 2)}</pre>
        <p className="h-12 flex flex-row items-end justify-center">
          client-side data fetching with RLS
        </p>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  );
};

export default LoginPage;
