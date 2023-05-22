import sign from "jsonwebtoken";

export const createAccessToken = (userId) => {
  return sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
};

export const createRefreshToken = (userId) => {
  return sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
};

export const sendAccessToken = (res, req, accesstoken) => {
  res.send({
    accesstoken,
    email: req.body.email,
  });
};

export const sendRefreshToken = (res, refreshtoken) => {
  res.cookie("refreshtoken", refreshtoken, {
    httpOnly: true,
    path: "/refresh_token",
  });
};
