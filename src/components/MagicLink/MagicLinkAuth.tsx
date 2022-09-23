import { supabaseClient } from '@supabase/auth-helpers-nextjs';
import { useUser } from '@supabase/auth-helpers-react';
import { ErrorPayload } from '@supabase/auth-helpers-shared';
import dynamic from 'next/dynamic';
import { trpc } from '~/utils/trpc';
import { StrictUser } from '~/utils/user';

import LoadingSpinner from '../LoadingSpinner';
import SupabaseLogo from '../SupabaseLogo';

export function withMagicLinkAuth(
  Component: (props: { user: StrictUser }) => JSX.Element
) {
  return () => {
    const { user: _user, error } = useUser();
    const _role = trpc.useQuery(["api.me.role"]);

    try {
      if (_role.isLoading) {
        return (
          <div className="w-full min-h-screen flex flex-col items-center justify-center">
            <div className="mb-40">
              <LoadingSpinner />
            </div>
          </div>
        );
      } else {
        if (!!error || !_user) throw error;
        const { id, email } = _user;
        const role = _role.data;
        const user = { id, email, role } as StrictUser;
        return <Component user={user} />;
      }
    } catch (e) {
      return <MagicLinkAuth error={error} />;
    }
  };
}

export function useMagicLink() {
  return dynamic(
    async () => {
      const MagicLinkForm = await import("./MagicLinkForm").then(
        (_module) => _module.default
      );
      return (props: MagicLinkAuthProps) => {
        const { error } = props;
        return (
          <div className="max-w-xs mb-40 flex flex-col items-center">
            {error && <div>{error.message}</div>}
            <MagicLinkForm
              supabaseClient={supabaseClient}
              redirectTo={`/login`}
            />
            <div className="flex flex-row items-center space-x-2 mt-8">
              <div>Powered by</div>
              <SupabaseLogo />
            </div>
          </div>
        );
      };
    },
    {
      ssr: false,
      loading: () => (
        <div className="mb-40">
          <LoadingSpinner />
        </div>
      ),
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
