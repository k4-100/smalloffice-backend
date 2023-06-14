import { sign, Secret } from "jsonwebtoken";

export const createAccessToken = (userId: string) => {
  return sign({ userId }, process.env.ACCESS_TOKEN_SECRET as Secret, {
    expiresIn: "5m",
  });
};

export const createRefreshToken = (userId: any) => {
  return sign({ userId }, process.env.REFRESH_TOKEN_SECRET as Secret, {
    expiresIn: "1d",
  });
};

export const sendAccessToken = (
  res: any,
  req: any,
  accesstoken: any,
  id: string,
  username: string
) => {
  res.status(200).send({
    success: true,
    id,
    username,
    accesstoken,
    // email: req.body.email,
  });
};

export const sendRefreshToken = (res: any, refreshtoken: any) => {
  res.cookie("refreshtoken", refreshtoken, {
    // httpOnly: true,
    httpOnly: true,
    path: "/accounts/refresh_token",
  });
};