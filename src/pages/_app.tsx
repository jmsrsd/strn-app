import { supabaseClient } from "@supabase/auth-helpers-nextjs";
import { UserProvider } from "@supabase/auth-helpers-react";
import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "react-query";
import { withTRPC } from "~/utils/trpc";
import "../styles/globals.css";

const queryClient = new QueryClient();

export default withTRPC(({ Component, pageProps }: AppProps) => {
  return (
    <UserProvider supabaseClient={supabaseClient}>
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </UserProvider>
  );
});
