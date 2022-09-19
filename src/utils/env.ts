export type EnvKey =
  | "APPLICATION_NAME"
  | "DATABASE_URL"
  | "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  | "NEXT_PUBLIC_SUPABASE_URL"
  | "SUPABASE_SERVICE_KEY";

export const env = (key: EnvKey): string => {
  return process.env[key] ?? "";
};
