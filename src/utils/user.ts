import { User as SupabaseUser, withPageAuth } from '@supabase/auth-helpers-nextjs';
import { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from 'next';
import * as supabase from '~/utils/supabase';

import { NextApiHandlerProps } from './next';
import { Nullish } from './types';

export type Slug = string | string[];

export type StrictWithUserProps = {
  user: SupabaseUser;
  role: string;
  slug?: string | string[];
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
    console.log(selected.data);
    return { ...selected.data }[0].value ?? "";
  } catch (e) {
    console.error(e);
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
        const slug = context.params?.slug ?? null;
        const props = { role, slug };
        return { props };
      },
    });

    return await pageAuth(context);
  },
  withUser: (Component: (user: StrictUser, slug?: Slug) => JSX.Element) => {
    return ({ user, role, slug }: StrictWithUserProps) => {
      const { id, email } = { ...user, email: user.email! };
      return Component({ id, email, role }, slug);
    };
  },
};

export type UnstrictWithUserProps = {
  user?: SupabaseUser | Nullish;
  role?: string | Nullish;
  slug?: string | string[] | Nullish;
};

export type UnstrictUser = {
  id?: string | Nullish;
  email?: string | Nullish;
  role?: string | Nullish;
};

export const unstrict = {
  getServerSideUser: async (context: GetServerSidePropsContext) => {
    const serverSideUser = await strict.getServerSideUser(context);
    const props: UnstrictWithUserProps = serverSideUser.props ?? {};
    return { props };
  },
  withUser: (
    Component: (user: UnstrictUser, slug?: Slug | Nullish) => JSX.Element
  ) => {
    return ({ user, role, slug }: UnstrictWithUserProps) => {
      const { id, email } = user ?? {};
      return Component({ id, email, role }, slug);
    };
  },
};
