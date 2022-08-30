import { withApiAuth } from "@supabase/auth-helpers-nextjs";
import * as trpcNext from "@trpc/server/adapters/next";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { CreateContext, makeCreateContext } from "~/server/createContext";
import { appRouter } from "~/server/route/app.router";

const withCreateContext = (
  createNextApiHandler: (createContext: CreateContext) => NextApiHandler<any>
) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const createContext = await makeCreateContext({ req, res });
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
        if (error.code === "INTERNAL_SERVER_ERROR") {
          console.error("Something went wrong", error);
        } else {
          console.error(error);
        }
      },
    });
  })
);
