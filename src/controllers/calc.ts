import express from "express";
import { isAuth } from "../common/isAuth";

const calcControllers = {
  load(req: express.Request, res: express.Response) {
    try {
      const userId = isAuth(req);
      // if (userId !== null) {
      //   res.status(200).json({
      //     success: true,
      //     message: "This is protected data.",
      //   });
      // }
      res.status(220).json({
        success: true,
        message: "loaded sheet successfully",
        userId,
      });
    } catch (err: any) {
      res.send({
        success: false,
        error: `${err.message}`,
      });
    }
  },

  save(req: express.Request, res: express.Response) {
    return;
  },

  // app.get("/api/v1", (req, res) => {
  //   res.status(200).json({
  //     success: true,
  //     message: "api root",
  //   });
  // });

  // app.post("/protected", async (req, res) => {
  //   try {
  //     const userId = isAuth(req);
  //     if (userId !== null) {
  //       res.status(200).json({
  //         success: true,
  //         message: "This is protected data.",
  //       });
  //     }
  //   } catch (err: any) {
  //     res.send({
  //       success: false,
  //       error: `${err.message}`,
  //     });
  //   }
  // });
};

export default calcControllers;
