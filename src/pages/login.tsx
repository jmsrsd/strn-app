import { useRouter } from "next/router";
import { useEffect } from "react";
import { withMagicLinkAuth } from "~/components/MagicLink/MagicLinkAuth";
import urls from "~/utils/urls";

const LoginPage = withMagicLinkAuth((user) => {
  const router = useRouter();

  useEffect(() => {
    router.replace(`${urls.base}/profile`);
  }, [router, user]);

  return (
    <div className="w-full min-h-screen">
      <div className="m-auto flex flex-col space-y-4">
        <p className="h-12 flex flex-row items-end justify-center">
          Successfully logged in
        </p>
        {
          /* <pre className="flex flex-col items-center">
          {JSON.stringify(user, null, 2)}
        </pre> */
        }
      </div>
    </div>
  );
});

export default LoginPage;
