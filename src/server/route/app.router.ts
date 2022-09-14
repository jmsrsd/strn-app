import { createRouter } from "../router";
import { dataRouter } from "./data.router";
import { domainRouter } from "./domain.router";
import { entityRouter } from "./entity.router";
import { postRouter } from "./post.router";

export const appRoute = "strn-blog-app";

export const appRouter = createRouter()
  .merge("data.", dataRouter)
  .merge("domain.", domainRouter)
  .merge("entity.", entityRouter)
  .merge("post.", postRouter);

export type AppRouter = typeof appRouter;
