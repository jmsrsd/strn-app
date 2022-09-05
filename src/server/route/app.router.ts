import { createRouter } from "../utils/router";
import { dataRouter } from "./data.router";

export const appRouter = createRouter().merge("data.", dataRouter);

export type AppRouter = typeof appRouter;
