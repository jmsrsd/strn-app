import { strict } from '~/utils/user';

export const getServerSideProps = strict.getServerSideUser;

export default strict.withUser((user, params) => {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center">
      <div className="w-80 flex flex-col items-center">
        <h1>{`This is Post Detail Page ${JSON.stringify(params)}`}</h1>
      </div>
    </div>
  );
});
