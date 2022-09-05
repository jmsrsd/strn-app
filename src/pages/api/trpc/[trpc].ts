import { withApiAuth } from "@supabase/auth-helpers-nextjs";
import * as trpcNext from "@trpc/server/adapters/next";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { appRouter } from "~/server/route/app.router";
import { CreateContext, getCreateContext } from "~/server/utils/context";

const withCreateContext = (
  createNextApiHandler: (createContext: CreateContext) => NextApiHandler<any>
) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const createContext = await getCreateContext({ req, res });
    const nextApiHandler = createNextApiHandler(createContext);
    await nextApiHandler(req, res);
  };
};

export default withApiAuth(
  withCreateContext((createContext) => {
    return trpcNext.createNextApiHandler({
      router: appRouter,
      createContext,
      onError({ error }) {
        switch (error.code) {
          case "INTERNAL_SERVER_ERROR":
            console.error("Something went wrong", error);
            break;
          default:
            console.error(error);
            break;
        }
      },
    });
  })
);
