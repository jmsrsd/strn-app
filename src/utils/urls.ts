const base = process.env.NEXT_PUBLIC_VERCEL_URL
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : "http://localhost:3000";

const api = {
  trpc: `${base}/api/trpc`,
};

const urls = {
  base,
  api,
};

export default urls;
