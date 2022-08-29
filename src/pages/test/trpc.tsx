import { trpc } from "~/utils/trpc";
import { getServerSideUser, withUser } from "~/utils/withUser";

export const getServerSideProps = getServerSideUser;

export default withUser((user) => {
  const query = trpc.useQuery(["json.test"]);
  const mutation = trpc.useMutation(["json.clear"]);

  if (query.isLoading || mutation.isLoading) return <pre>Loading...</pre>;

  return (
    <>
      <button
        onClick={async () => {
          await mutation.mutateAsync();
          await query.refetch();
        }}
      >
        CLEAR ALL
      </button>
      <pre>{JSON.stringify(user, null, 2)}</pre>
      <pre>{JSON.stringify(query.data, null, 2)}</pre>
    </>
  );
});
