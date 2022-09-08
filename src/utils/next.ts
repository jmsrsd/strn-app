import { NextApiRequest, NextApiResponse } from "next";

export type NextApiHandlerProps = {
  req: NextApiRequest;
  res: NextApiResponse;
};
