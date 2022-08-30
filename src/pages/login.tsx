import { supabaseClient } from "@supabase/auth-helpers-nextjs";
import { withMagicLinkAuth } from "~/components/MagicLinkAuth";

export default withMagicLinkAuth(({ user, error }) => {
  return (
    <div className="w-full min-h-screen">
      <div className="m-auto flex flex-col space-y-4">
        <button
          className="bg-gray-900 py-2 px-4 my-4 mx-auto rounded-md text-white font-bold"
          onClick={supabaseClient.auth.signOut}
        >
          SIGN OUT
        </button>
        <p className="h-12 flex flex-row items-end justify-center">
          Successfully logged in as
        </p>
        <pre className="flex flex-col items-center">
          {JSON.stringify({ id: user?.id, email: user?.email }, null, 2)}
        </pre>
      </div>
    </div>
  );
});
