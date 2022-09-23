import '../styles/globals.css';
import 'tailwindcss/tailwind.css';

import { supabaseClient } from '@supabase/auth-helpers-nextjs';
import { UserProvider } from '@supabase/auth-helpers-react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { withTRPC } from '~/utils/trpc';

import type { AppProps } from "next/app";

const queryClient = new QueryClient();

const MyApp = withTRPC(({ Component, pageProps }: AppProps) => {
  return (
    <UserProvider supabaseClient={supabaseClient}>
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </UserProvider>
  );
});

export default MyApp;
