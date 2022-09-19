import { createRouter } from '../router';
import { dataRouter } from './data.router';
import { modelRouter } from './model.router';
import { strnRouter } from './strn.router';
import { strndbRouter } from './strndb.router';

export const appRouter = createRouter()
  .merge("data.", dataRouter)
  .merge("model.", modelRouter)
  .merge("strn.", strnRouter)
  .merge("strndb.", strndbRouter);

export type AppRouter = typeof appRouter;
