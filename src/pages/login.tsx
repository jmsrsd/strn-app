import { supabaseClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import { withMagicLinkAuth } from "~/components/MagicLinkAuth";

export default function LoginPage() {
  return withMagicLinkAuth(({ user, error }) => {
    const [data, setData] = useState<any>();

    useEffect(() => {
      async function loadData() {
        const { data } = await supabaseClient.from("json").select("*");
        setData(data);
      }
      if (user) loadData();
    }, [user]);

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
          <pre>
            {JSON.stringify({ id: user?.id, email: user?.email }, null, 2)}
          </pre>
          <p className="h-12 flex flex-row items-end justify-center">
            client-side data fetching with RLS
          </p>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      </div>
    );
  });
}
