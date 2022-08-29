import { supabaseClient } from "@supabase/auth-helpers-nextjs";
import { UserProvider } from "@supabase/auth-helpers-react";
import { httpBatchLink } from "@trpc/client/links/httpBatchLink";
import { loggerLink } from "@trpc/client/links/loggerLink";
import { withTRPC } from "@trpc/next";
import { NextComponentType } from "next";
import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "react-query";
import superjson from "superjson";
import { AppRouter } from "~/server/route/app.router";
import urls from "~/utils/urls";
import "../styles/globals.css";

function applyTRPC(
  AppOrPage: NextComponentType<any, any, any>
): NextComponentType {
  const apply = withTRPC<AppRouter>({
    config({ ctx }) {
      return {
        headers() {
          if (!ctx?.req) return {};
          return {
            ...ctx.req.headers,
            "x-ssr": "1",
          };
        },
        transformer: superjson,
        links: [
          loggerLink(),
          httpBatchLink({
            maxBatchSize: 10,
            url: urls.api.trpc,
          }),
        ],
      };
    },
    ssr: false,
  });

  return apply(AppOrPage);
}

const queryClient = new QueryClient();

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <UserProvider supabaseClient={supabaseClient}>
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </UserProvider>
  );
};

export default applyTRPC(MyApp);
