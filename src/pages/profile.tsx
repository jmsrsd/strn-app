import { withPageAuth, User } from "@supabase/auth-helpers-nextjs";

type ProfileProps = {
  user: User;
};

export default function Profile({ user }: ProfileProps) {
  return <div>Hello {user.email}</div>;
}

export const getServerSideProps = withPageAuth({ redirectTo: "/login" });
