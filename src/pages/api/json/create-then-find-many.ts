import { withApiAuth } from "@supabase/auth-helpers-nextjs";
import { prisma, prismaHelper } from "~/utils/prisma";

export default withApiAuth(async (req, res) => {
  await prisma.json.create({
    data: {
      value: {
        createdAt: +Date.now(),
      },
    },
  });

  const data = await prisma.json
    .findMany()
    .then((data) => prismaHelper.serialize(data));

  res.json(data);
});
