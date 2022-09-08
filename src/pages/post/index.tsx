import { strict } from "~/utils/user";

export const getServerSideProps = strict.getServerSideUser;

export default strict.withUser((user, slug) => {
  return <>{`${slug}`}</>;
});
