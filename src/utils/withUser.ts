import {
  User as SupabaseUser,
  withPageAuth,
} from "@supabase/auth-helpers-nextjs";

export type User = {
  id: string;
  email: string;
};

export type WithUserProps = {
  user: SupabaseUser;
};

export const getServerSideUser = withPageAuth({
  redirectTo: "/login",
});

export const withUser = (fn: (user: User) => JSX.Element) => {
  return ({ user }: WithUserProps) => {
    return fn({
      id: user.id,
      email: user.email!,
    });
  };
};
