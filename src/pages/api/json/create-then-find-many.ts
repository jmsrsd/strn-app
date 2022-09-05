import { withApiAuth } from "@supabase/auth-helpers-nextjs";
import { prisma, serialize } from "~/utils/prisma";

export default withApiAuth(async (req, res) => {
  await prisma.data.create({
    data: {
      value: {
        createdAt: +Date.now(),
      },
    },
  });

  const data = await prisma.data.findMany().then(serialize);

  res.json(data);
});
