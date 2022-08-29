import { User, withPageAuth } from "@supabase/auth-helpers-nextjs";
import { trpc } from "~/utils/trpcs";

export const getServerSideProps = withPageAuth({
  redirectTo: "/login",
  async getServerSideProps(context) {
    return {
      props: {},
    };
  },
});

type PageProps = {
  user: User;
};

export default function Page({ user }: PageProps) {
  const { data, isLoading } = trpc.useQuery(["json.test"]);

  if (isLoading) return <pre>Loading...</pre>;

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
