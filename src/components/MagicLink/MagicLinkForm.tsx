import { SupabaseClient } from "@supabase/supabase-js";
import {
  Button,
  IconInbox,
  IconMail,
  Input,
  Space,
  Typography,
} from "@supabase/ui";
import { useState } from "react";

export default function MagicLink({
  supabaseClient,
  redirectTo,
}: {
  supabaseClient: SupabaseClient;
  redirectTo?: string | undefined;
}) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleMagicLinkSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    const { error } = await supabaseClient.auth.signIn(
      { email },
      { redirectTo }
    );
    if (error) setError(error.message);
    else setMessage("Check your email for the magic link");
    setLoading(false);
  };

  return (
    <form id="auth-magic-link" onSubmit={handleMagicLinkSignIn}>
      <Space size={4} direction={"vertical"}>
        <Space size={3} direction={"vertical"}>
          <p className="mx-auto">Authentication with Supabase ⚡</p>
          <Input
            label=""
            placeholder="Your email address"
            icon={<IconMail size={21} stroke={"#666666"} />}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
          />
          <Button
            block
            size="large"
            htmlType="submit"
            icon={<IconInbox size={21} />}
            loading={loading}
          >
            SEND MAGIC LINK
          </Button>
        </Space>
        <div className="flex flex-col items-center">
          {message && <Typography.Text>{message}</Typography.Text>}
          {error && <Typography.Text type="danger">{error}</Typography.Text>}
        </div>
      </Space>
    </form>
  );
}
