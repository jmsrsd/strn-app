import { getServerSideUser, withUser } from "~/utils/withUser";

export const getServerSideProps = getServerSideUser;

export default withUser((user) => {
  return (
    <pre>{JSON.stringify({ id: user.id, email: user.email }, null, 2)}</pre>
  );
});
