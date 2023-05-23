import { sign, Secret } from "jsonwebtoken";

export const createAccessToken = (userId: string) => {
  return sign({ userId }, process.env.ACCESS_TOKEN_SECRET as Secret, {
    expiresIn: "15m",
  });
};

export const createRefreshToken = (userId: any) => {
  return sign({ userId }, process.env.REFRESH_TOKEN_SECRET as Secret, {
    expiresIn: "1d",
  });
};

export const sendAccessToken = (res: any, req: any, accesstoken: any) => {
  res.send({
    accesstoken,
    email: req.body.email,
  });
};

export const sendRefreshToken = (res: any, refreshtoken: any) => {
  res.cookie("refreshtoken", refreshtoken, {
    httpOnly: true,
    path: "/refresh_token",
  });
};
