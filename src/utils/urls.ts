const base = process.env.NEXT_PUBLIC_VERCEL_URL
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : "http://localhost:3000";

const urls = {
  base,
  api: {
    trpc: `${base}/api/trpc`,
  },
};

export default urls;
