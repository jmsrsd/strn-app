import { User, withPageAuth } from "@supabase/auth-helpers-nextjs";

type ProfileProps = {
  user: User;
};

export default function Profile({ user }: ProfileProps) {
  return (
    <pre>{JSON.stringify({ id: user.id, email: user.email }, null, 2)}</pre>
  );
}

export const getServerSideProps = withPageAuth({ redirectTo: "/login" });
