import { User, withPageAuth } from "@supabase/auth-helpers-nextjs";
import { useQuery } from "@tanstack/react-query";
import prisma, { makeSerializable } from "~/utils/prisma";
import withSupabaseCookie from "~/utils/withSupabaseCookie";

export const getServerSideProps = withPageAuth({
  redirectTo: "/login",
  async getServerSideProps(ctx) {
    await prisma.json.create({
      data: {
        value: {
          hello: `world`,
        },
      },
    });
    return {
      props: {
        data: await prisma.json
          .findMany()
          .then((values) => makeSerializable(values)),
      },
    };
  },
});

export default function ProtectedPage({
  user,
  data,
}: {
  user: User;
  data: any;
}) {
  const query = useQuery([`/api/hello`], async () => {
    return await fetch(`/api/hello`, {
      method: `POST`,
    }).then(async (res) => {
      return await withSupabaseCookie(res).json();
    });
  });

  return (
    <>
      <pre>{JSON.stringify(query.data, null, 2)}</pre>
      <div>Protected content for {user.email}</div>
      <pre>{JSON.stringify({ id: user.id, email: user.email }, null, 2)}</pre>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </>
  );
}
