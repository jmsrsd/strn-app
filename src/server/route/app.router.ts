import { createRouter } from '../router';
import { dataRouter } from './data.router';
import { modelRouter } from './model.router';
import { strnRouter } from './strn.router';

export const appRouter = createRouter()
  .merge("data.", dataRouter)
  .merge("model.", modelRouter)
  .merge("strn.", strnRouter);

export type AppRouter = typeof appRouter;
