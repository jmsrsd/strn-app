import {
  supabaseServerClient,
  User,
  withPageAuth,
} from "@supabase/auth-helpers-nextjs";

export const getServerSideProps = withPageAuth({
  redirectTo: "/login",
  async getServerSideProps(ctx) {
    // Run queries with RLS on the server
    const { data } = await supabaseServerClient(ctx).from("json").select("*");
    return { props: { data } };
  },
});

export default function ProtectedPage({
  user,
  data,
}: {
  user: User;
  data: any;
}) {
  return (
    <>
      <div>Protected content for {user.email}</div>
      <pre>{JSON.stringify({ id: user.id, email: user.email }, null, 2)}</pre>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </>
  );
}
