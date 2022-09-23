import { createRouter } from '../router';
import { apiRouter } from './api.router';

export const appRouter = createRouter().merge("api.", apiRouter);

export type AppRouter = typeof appRouter;
