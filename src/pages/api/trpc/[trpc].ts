import * as trpcNext from "@trpc/server/adapters/next";
import { NextApiRequest, NextApiResponse } from "next";
import { createContextWithApiAuth } from "~/server/createContext";
import { appRouter } from "../../../server/route/app.router";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  await trpcNext.createNextApiHandler({
    router: appRouter,
    createContext: await createContextWithApiAuth(req, res),
    onError({ error }) {
      if (error.code === "INTERNAL_SERVER_ERROR") {
        console.error("Something went wrong", error);
      } else {
        console.error(error);
      }
    },
  })(req, res);
};
