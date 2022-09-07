import { createRouter } from "../router";
import { DataDocumentKey, dataRouter } from "./data.router";

export const AppCollectionKey = "strn-blog-app";

export const appRouter = createRouter().merge(
  `${DataDocumentKey}.`,
  dataRouter
);

export type AppRouter = typeof appRouter;
