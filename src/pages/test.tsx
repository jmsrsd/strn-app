import { User, withPageAuth } from "@supabase/auth-helpers-nextjs";
import { useQuery } from "react-query";

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
  const useRouteQuery = <T extends any>(
    route: string,
    fn: (route: string) => Promise<T>
  ) => useQuery(route, async () => await fn(route));

  const routes = {
    hello: `/api/hello`,
    json: {
      createThenFindMany: `/api/json/create-then-find-many`,
    },
  };

  const hello = useRouteQuery(routes.hello, async (route) => {
    return await fetch(route, {
      method: `POST`,
    }).then(async (res) => await res.json());
  });

  const jsonApi = useRouteQuery(
    routes.json.createThenFindMany,
    async (route) => {
      return await fetch(route, {
        method: `POST`,
      }).then(async (res) => await res.json());
    }
  );

  return (
    <>
      <pre>{JSON.stringify(hello.data, null, 2)}</pre>
      <div>Protected content for {user.email}</div>
      <pre>{JSON.stringify({ id: user.id, email: user.email }, null, 2)}</pre>
      <pre>{JSON.stringify(jsonApi.data, null, 2)}</pre>
    </>
  );
}
