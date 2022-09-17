const env = (
  key:
    | "APPLICATION_KEY"
    | "DATABASE_URL"
    | "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    | "NEXT_PUBLIC_SUPABASE_URL"
    | "SUPABASE_SERVICE_KEY",
): string => {
  return `${process.env[key]}`;
};

export default env;
