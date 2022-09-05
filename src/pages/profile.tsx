import { supabaseClient } from "@supabase/auth-helpers-nextjs";
import { trpc } from "~/utils/trpc";
import { strict } from "~/utils/user";

export const getServerSideProps = strict.getServerSideUser;

export default strict.withUser((user) => {
  const me = trpc.useQuery(["data.me"]);

  return (
    <div className="min-w-max min-h-screen flex flex-col items-center justify-center space-y-4">
      <pre>{me.isLoading ? `Loading...` : JSON.stringify(me.data)}</pre>
      <pre>{JSON.stringify(user, null, 2)}</pre>
      <button
        className="bg-gray-900 py-2 px-4 my-4 mx-auto rounded-md text-white font-bold"
        onClick={async () => {
          await supabaseClient.auth.signOut();
        }}
      >
        SIGN OUT
      </button>
    </div>
  );
});
