import { Auth } from "@supabase/ui";
import { useUser } from "@supabase/auth-helpers-react";
import { supabaseClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";

const LoginPage = () => {
  const { user, error } = useUser();
  const [data, setData] = useState<any>();

  useEffect(() => {
    async function loadData() {
      const { data } = await supabaseClient.from("json").select("*");
      setData(data);
    }
    // Only run query once user is logged in.
    if (user) loadData();
  }, [user]);

  if (!user)
    return (
      <div className="w-full min-h-screen">
        <div className="m-auto max-w-xs">
          {error && <p>{error.message}</p>}
          <Auth
            supabaseClient={supabaseClient}
            magicLink={true}
            view="magic_link"
          />
        </div>
      </div>
    );

  return (
    <div className="w-full min-h-screen">
      <div className="m-auto max-w-xs">
        <button onClick={() => supabaseClient.auth.signOut()}>Sign out</button>
        <p>user:</p>
        <pre>{JSON.stringify(user, null, 2)}</pre>
        <p>client-side data fetching with RLS</p>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  );
};

export default LoginPage;
