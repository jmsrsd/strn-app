import {
  User as SupabaseUser,
  withPageAuth,
} from "@supabase/auth-helpers-nextjs";
import { GetServerSidePropsContext } from "next";
import * as supabase from "~/utils/supabase";
import { Nullish } from "./nullish";

export type StrictUser = {
  id: string;
  email: string;
  role: string;
};

export type StrictWithUserProps = {
  user: SupabaseUser;
  role: string;
};

export const getUserRole = async (nextApiMethods: supabase.NextApiMethods) => {
  try {
    const auth = await supabase.auth(nextApiMethods);
    const id = auth.user?.id;
    const role = () => supabase.service().from("role");
    let selected = await role().select("*").eq("id", id);
    if ((selected.data?.length ?? 0) < 1) {
      await role().upsert({
        id,
        data: "user",
      });
      selected = await role().select("*").eq("id", id);
    }
    return `${(selected.data ?? [])[0].value}`;
  } catch (e) {
    return `guest`;
  }
};

export const strict = {
  getServerSideUser: withPageAuth({
    redirectTo: "/login",
    getServerSideProps: async ({ req, res }) => {
      const methods: any = { req, res };
      return {
        props: {
          role: await getUserRole(methods),
        },
      };
    },
  }),
  withUser: (Component: (user: StrictUser) => JSX.Element) => {
    return ({ user, role }: StrictWithUserProps) => {
      return Component({
        id: user.id,
        email: user.email!,
        role: role,
      });
    };
  },
};

export type NullishUser = {
  id?: string | Nullish;
  email?: string | Nullish;
  role?: string | Nullish;
};

export type NullishWithUserProps = {
  user?: SupabaseUser | Nullish;
  role?: string | Nullish;
};

export const nullish = {
  getServerSideUser: async (context: GetServerSidePropsContext) => {
    const serverSideUser = await strict.getServerSideUser(context);
    const props: NullishWithUserProps = serverSideUser.props ?? {};
    return {
      props,
    };
  },
  withUser: (Component: (user: NullishUser) => JSX.Element) => {
    return ({ user, role }: NullishWithUserProps) => {
      return Component({
        id: user?.id,
        email: user?.email,
        role: role,
      });
    };
  },
};
