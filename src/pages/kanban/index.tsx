import { supabaseClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { strict } from '~/utils/user';

export const getServerSideProps = strict.getServerSideUser;

export default strict.withUser(({ id, email, role }) => {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const logout = async () => {
    setIsLoggingOut(true);
    await supabaseClient.auth.signOut();
    router.reload();
  };

  return (
    <>
      <div className="w-full flex flex-row items-center space-x-2 fixed p-4 z-50">
        {[
          ["✉️", email],
          ["👤", role],
        ].map((entry) => {
          const key = JSON.stringify(entry);
          const [emoji, text] = entry;
          return (
            <div
              className="py-2 px-4 flex flex-row items-center bg-black text-white text-sm font-bold rounded-md space-x-4 font-mono"
              key={key}
            >
              <div>{emoji}</div>
              <div>{text}</div>
            </div>
          );
        })}
        <div className="grow" />
        <button
          className="py-2 px-4 bg-black text-white font-bold rounded-md"
          disabled={isLoggingOut}
          onClick={logout}
        >
          {isLoggingOut ? "LOGGING OUT..." : "LOG OUT"}
        </button>
      </div>
      <div className="w-full min-h-screen flex flex-col items-center justify-start space-y-8">
        <div className="w-full h-screen bg-red-500"></div>
        <div className="w-full h-screen bg-green-500"></div>
        <div className="w-full h-screen bg-blue-500"></div>
      </div>
    </>
  );
});
