import { createRouter } from "../router";
import { dataRouter } from "./data.router";
import { modelRouter } from "./model.router";

export const appRouter = createRouter()
  .merge("data.", dataRouter)
  .merge("model.", modelRouter);

export type AppRouter = typeof appRouter;
