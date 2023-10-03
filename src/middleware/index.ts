import express from "express";
import { isAuth } from "../common/isAuth";
// import { CustomRequest } from "../types/types";

export const authUser = (req: any, res: express.Response, next: any) => {
  req.userId = isAuth(req);

  if (req.userId == null) {
    return res.status(500).json({
      success: false,
      message: "userID == null",
    });
  }

  next();
};
