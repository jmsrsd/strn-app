import { trpc } from "~/utils/trpc";
import { strict } from "~/utils/user";

export const getServerSideProps = strict.getServerSideUser;

export default strict.withUser((user) => {
  const query = trpc.useQuery(["data.test"]);
  const mutation = trpc.useMutation(["data.clear"], {
    onSuccess: async (input) => {
      await query.refetch();
    },
  });

  if (query.isLoading || mutation.isLoading) return <pre>Loading...</pre>;

  return (
    <>
      <button
        onClick={() => {
          mutation.mutate();
        }}
      >
        CLEAR ALL
      </button>
      <pre>{JSON.stringify(user, null, 2)}</pre>
      <pre>{JSON.stringify(query.data, null, 2)}</pre>
    </>
  );
});
