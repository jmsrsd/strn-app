import { createRouter } from '../router';
import { dataRouter } from './data.router';
import { strndbRouter } from './strndb.router';

export const appRouter = createRouter()
  .merge("data.", dataRouter)
  .merge("strndb.", strndbRouter);

export type AppRouter = typeof appRouter;
