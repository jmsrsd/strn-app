import { httpBatchLink } from '@trpc/client/links/httpBatchLink';
import { withTRPC as withTRPCNext } from '@trpc/next';
import { createReactQueryHooks } from '@trpc/react';
import { NextComponentType } from 'next';
import superjson from 'superjson';

import { AppRouter } from '../server/route/app.router';
import urls from './urls';

// import { loggerLink } from "@trpc/client/links/loggerLink";

export const trpc = createReactQueryHooks<AppRouter>();

export function withTRPC(
  AppOrPage: NextComponentType<any, any, any>
): NextComponentType {
  const applyTRPC = withTRPCNext<AppRouter>({
    config: ({ ctx }) => ({
      headers: () => {
        const req = ctx?.req;
        if (!req) return {};
        return { ...req.headers, "x-ssr": "1" };
      },
      transformer: superjson,
      links: [
        // loggerLink(),
        httpBatchLink({ maxBatchSize: 10, url: urls.api.trpc }),
      ],
    }),
    ssr: false,
  });

  return applyTRPC(AppOrPage);
}
