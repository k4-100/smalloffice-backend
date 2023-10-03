import express from "express";
import { isAuth } from "../common/isAuth";

const authUser = (req: CustomRequest, res: express.Response, next: any) => {
  const userId = isAuth(req);

  if (userId == null) {
    return res.status(500).json({
      success: false,
      message: "userID == null",
    });
  }

  req.userId = userId;
  next();
};
