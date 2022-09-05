import { supabaseClient } from "@supabase/auth-helpers-nextjs";
import { useUser } from "@supabase/auth-helpers-react";
import { ErrorPayload } from "@supabase/auth-helpers-shared";
import dynamic, { DynamicOptions } from "next/dynamic";
import { trpc } from "~/utils/trpc";
import { StrictUser } from "~/utils/user";
import LoadingSpinner from "../LoadingSpinner";
import SupabaseLogo from "../SupabaseLogo";

export function withMagicLinkAuth(
  Component: (props: { user: StrictUser }) => JSX.Element
) {
  return () => {
    const { user, error } = useUser();
    const role = trpc.useQuery(["data.me"]);
    try {
      if (!!error || !user) throw error;
      return role.isLoading ? (
        <></>
      ) : (
        <Component
          user={{
            id: user?.id!,
            email: user?.email!,
            role: role.data!,
          }}
        />
      );
    } catch (e) {
      return <MagicLinkAuth error={error} />;
    }
  };
}

export function useMagicLink() {
  return dynamic(
    async () => {
      const MagicLinkForm = await import("./MagicLinkForm").then(
        (mod) => mod.default
      );
      return (props: MagicLinkAuthProps) => {
        const { error } = props;
        return (
          <div className="max-w-xs mb-40 flex flex-col items-center">
            {error && <p>{error.message}</p>}
            <MagicLinkForm
              supabaseClient={supabaseClient}
              redirectTo={`/login`}
            />
            <span className="flex flex-row items-center space-x-2 mt-8">
              <p>Powered by</p>
              <SupabaseLogo />
            </span>
          </div>
        );
      };
    },
    {
      ssr: false,
      loading: () => {
        return (
          <div className="mb-40">
            <LoadingSpinner />
          </div>
        );
      },
    }
  );
}

export type MagicLinkAuthProps = { error: ErrorPayload | undefined };

export default function MagicLinkAuth(props: MagicLinkAuthProps) {
  const MagicLink = useMagicLink();
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <MagicLink {...props} />
    </div>
  );
}
