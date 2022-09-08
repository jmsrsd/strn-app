import { createRouter } from "../router";
import { dataKey, dataRouter } from "./data.router";
import { domainKey, domainRouter } from "./domain.router";
import { postKey, postRouter } from "./post.router";

export const appKey = "strn-blog-app";

export const appRouter = createRouter()
  .merge(`${dataKey}.`, dataRouter)
  .merge(`${domainKey}.`, domainRouter)
  .merge(`${postKey}.`, postRouter);

export type AppRouter = typeof appRouter;
