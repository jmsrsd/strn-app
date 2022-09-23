import { User as SupabaseUser, withPageAuth } from '@supabase/auth-helpers-nextjs';
import { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from 'next';
import { ParsedUrlQuery } from 'querystring';
import * as supabase from '~/utils/supabase';

import { NextApiHandlerProps } from './next';
import { Nullish } from './types';

export type StrictWithUserProps = {
  user: SupabaseUser;
  role: string;
  params?: ParsedUrlQuery;
};

export type StrictUser = {
  id: string;
  email: string;
  role: string;
};

export const getUserRole = async (props: NextApiHandlerProps) => {
  try {
    const auth = await supabase.auth(props);
    const id = auth.user?.id;
    const role = () => supabase.service().from("role");
    let selected = await role().select("*").eq("id", id);
    if (selected.data?.length ?? 0 < 1) {
      await role().upsert({ id, data: "user" });
      selected = await role().select("*").eq("id", id);
    }
    const first = { ...selected.data }[0];
    const result: string | null | undefined = first?.value;
    return result ?? "";
  } catch (e) {
    return "guest";
  }
};

export const strict = {
  getServerSideUser: async (context: GetServerSidePropsContext) => {
    const pageAuth = withPageAuth({
      redirectTo: "/login",
      getServerSideProps: async ({ req, res }) => {
        const role = await getUserRole({
          req: req as NextApiRequest,
          res: res as NextApiResponse,
        });
        const params = context.params ?? null;
        return { props: { role, params } };
      },
    });

    return await pageAuth(context);
  },
  withUser: (
    Component: (user: StrictUser, params?: ParsedUrlQuery) => JSX.Element
  ) => {
    return ({ user, role, params }: StrictWithUserProps) => {
      const { id, email } = { ...user, email: user.email! };
      return Component({ id, email, role }, params);
    };
  },
};

export type NonstrictWithUserProps = {
  user?: SupabaseUser | Nullish;
  role?: string | Nullish;
  params?: ParsedUrlQuery | Nullish;
};

export type NonstrictUser = {
  id?: string | Nullish;
  email?: string | Nullish;
  role?: string | Nullish;
};

export const nonstrict = {
  getServerSideUser: async (context: GetServerSidePropsContext) => {
    const serverSideUser = await strict.getServerSideUser(context);
    const props: NonstrictWithUserProps = serverSideUser.props ?? {};
    return { props };
  },
  withUser: (
    Component: (
      user: NonstrictUser,
      slug?: ParsedUrlQuery | Nullish
    ) => JSX.Element
  ) => {
    return ({ user, role, params }: NonstrictWithUserProps) => {
      const { id, email } = user ?? {};
      return Component({ id, email, role }, params);
    };
  },
};
