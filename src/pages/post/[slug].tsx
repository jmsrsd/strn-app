import { strict } from "~/utils/user";

export const getServerSideProps = strict.getServerSideUser;

export default strict.withUser((user, slug) => {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center">
      <div className="w-80 flex flex-col items-center">
        <h1>{`This is Post Detail Page ${slug}`}</h1>
      </div>
    </div>
  );
});
