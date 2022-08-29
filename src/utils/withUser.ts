import {
  User as SupabaseUser,
  withPageAuth,
} from "@supabase/auth-helpers-nextjs";

type User = {
  id: string;
  email: string;
};

export const getServerSideUser = withPageAuth({
  redirectTo: "/login",
});

export const withUser = (fn: (user: User) => JSX.Element) => {
  return ({ user }: { user: SupabaseUser }) => {
    return fn({
      id: user.id,
      email: user.email!,
    });
  };
};
