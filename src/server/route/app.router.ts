import { createRouter } from "../createRouter";
import { jsonRouter } from "./json.router";

export const appRouter = createRouter().merge("json.", jsonRouter);

export type AppRouter = typeof appRouter;
