import { Secret, verify } from "jsonwebtoken";

import dotenv from "dotenv";
dotenv.config();

const { env } = process;

export const isAuth = (req: any) => {
  const authorization = req.headers["authorization"];
  if (!authorization) throw new Error("You need to login");

  // 'Bearer TOKEN'
  const token = authorization.split(" ")[1];

  // const { userId } = verify(token, env.ACCESS_TOKEN_SECRET as any);
  const { userId } = verify(token, env.ACCESS_TOKEN_SECRET as Secret) as any;
  // const userId = 0;
  return userId;
};
