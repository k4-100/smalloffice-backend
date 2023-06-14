import { Secret } from "jsonwebtoken";
import {
  createAccessToken,
  createRefreshToken,
  sendAccessToken,
  sendRefreshToken,
} from "../common/token";
import fakeDB from "../models/fakeDB";
import { execute_query } from "../models/psql";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";

const accountsControllers = {
  async register(req: any, res: any) {
    const { username, password } = req.body;

    const user_query: any = await execute_query(
      `SELECT username FROM accounts 
        WHERE username='${username}'`
    );

    if (user_query[0]) {
      return res.status(409).json({
        success: false,
        message: "account already exists",
      });
    }
    bcrypt.hash(password, 10, function (err, hash) {
      execute_query(
        `INSERT INTO accounts(username,password) VALUES('${username}','${hash}' )`
      );
    });

    res.status(200).json({
      success: true,
      message: "account created",
    });
  },

  async login(req: any, res: any) {
    const { username, password } = req.body;

    try {
      const user_query: any = await execute_query(
        `SELECT id, username, password FROM accounts 
        WHERE username='${username}'`
      );

      const user: any = user_query[0];

      console.log("user: ", user);

      // checks if user is in db
      if (!user) {
        res.status(400).json({
          success: false,
          message: "account doesn't exist",
        });
        return;
      }

      // checks if password matches
      const passwordMatches: boolean = bcrypt.compareSync(
        password,
        (user as any).password as any
      );

      if (!passwordMatches) {
        res.status(403).json({
          success: false,
          message: "wrong credentials",
        });
        return;
      }

      // 3. Create Refresh- and Accesstoken
      const accesstoken = createAccessToken((user as any).id);
      const refreshtoken = createRefreshToken((user as any).id);
      console.log("refreshtoken: ", refreshtoken);
      user.refreshtoken = refreshtoken;
      const userIndex = fakeDB.findIndex((entry: any) => entry.id == user.id);
      if (userIndex === -1)
        fakeDB.push({ id: user.id, username: user.username, refreshtoken });
      else
        fakeDB[userIndex] = {
          id: user.id,
          username: user.username,
          refreshtoken,
        };
      console.log("fakeDB", fakeDB);
      sendRefreshToken(res, refreshtoken);
      sendAccessToken(res, req, accesstoken, user.id, user.username);
    } catch (err: any) {
      res.status(404).json({
        success: false,
        error: `${err.message}`,
      });
    }
  },

  logout(_req: any, res: any) {
    res.clearCookie("refreshtoken", { path: "/accounts/refresh_token" });
    return res.status(200).json({
      success: true,
      message: "Logged out",
    });
  },

  refresh_token(req: any, res: any) {
    const token = req.cookies.refreshtoken;
    console.log("cookies: ", req.cookies);
    // if there is no token in request
    if (!token)
      return res.status(403).json({
        success: false,
        message: "!token",
        accesstoken: "",
      });

    // We have a token, time to verify it
    let payload: any = null;
    try {
      payload = jsonwebtoken.verify(
        token,
        process.env.REFRESH_TOKEN_SECRET as Secret
      );
    } catch (err: any) {
      return res.status(404).json({
        success: false,
        message: "err",
        accesstoken: "",
      });
    }

    //token is valid, check if user exist
    const user = fakeDB.find((user: any) => user.id === payload.userId);
    if (!user)
      return res.status(404).json({
        success: false,
        message: "!user",
        accesstoken: "",
      });
    console.log("user: ", user);
    // user exists, check if refreshtoken exists on user
    if (user.refreshtoken !== token) {
      console.log("user: ", user, " token: ", token);
      return res.status(403).send({
        success: false,
        message: "user.refreshtoken !== token",
        accesstoken: "",
      });
    }
    // token exists, create new Refresh and Access token
    const accesstoken = createAccessToken(user.id);
    const refreshtoken = createRefreshToken(user.id);
    // update refreshtoken on user in db
    // Could have different versions instead
    user.refreshtoken = refreshtoken;
    // All good to go, send new refreshtoken and accesstoken
    sendRefreshToken(res, refreshtoken);
    return res.status(200).send({
      success: true,
      message: "finished",
      accesstoken,
    });
  },
  //
};

export default accountsControllers;