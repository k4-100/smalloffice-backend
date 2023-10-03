import { Secret } from "jsonwebtoken";
import {
  createAccessToken,
  createRefreshToken,
  sendAccessToken,
  sendRefreshToken,
} from "../common/token";
import fakeDB from "../models/fakeDB";
import { execute_query_with_values } from "../models/psql";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import {
  default_calc_table_content_buf,
  default_calc_table_content_sha256,
} from "../common/defaults";

const accountsControllers = {
  async register(req: any, res: any, next: any) {
    const { username, password } = req.body;
    // next();
    // check if user exists:
    let user_query: any = await execute_query_with_values(
      `SELECT username FROM accounts 
        WHERE username=$1`,
      [username]
    );

    if (user_query[0]) {
      return res.status(409).json({
        success: false,
        message: "account already exists",
      });
    }

    const hash = bcrypt.hashSync(password, 10);

    // insert user data:
    await execute_query_with_values(
      `INSERT INTO accounts(username,password) VALUES($1,$2)`,
      [username, hash]
    );

    // check if user was created properly:
    user_query = await execute_query_with_values(
      `SELECT id, username FROM accounts 
        WHERE username=$1`,
      [username]
    );

    if (!user_query[0].id)
      return res.status(500).json({
        success: true,
        message: "cannot select user for further account creation",
      });

    // add sheet
    await execute_query_with_values(
      `INSERT INTO calc_sheets(account_id) VALUES($1)`,
      [user_query[0].id]
    );

    // check if user was created properly:
    const sheet_query = await execute_query_with_values(
      `SELECT id FROM calc_sheets 
        WHERE account_id=$1`,
      [user_query[0].id]
    );

    if (!sheet_query[0].id)
      return res.status(500).json({
        success: true,
        message: "cannot select sheet for further account creation",
      });

    //     const query = `INSERT INTO calc_tables(calc_sheet_id, uncompressed_content_checksum, compressed_content)
    // VALUES(${
    //       sheet_query[0].id
    //     }, '${default_calc_table_content_sha256}',  decode('${default_calc_table_content_buf.toString(
    //       "hex"
    //     )}', 'hex') )`;
    const query = `INSERT INTO calc_tables(calc_sheet_id, uncompressed_content_checksum, compressed_content) VALUES($1, $2,  decode($3, 'hex') )`;

    for (let i = 0; i < 3; i++)
      await execute_query_with_values(query, [
        sheet_query[0].id,
        default_calc_table_content_sha256,
        default_calc_table_content_buf.toString("hex"),
      ]);

    res.status(200).json({
      success: true,
      message: "account created",
    });
  },

  async login(req: any, res: any) {
    const { username, password } = req.body;

    try {
      const user_query: any = await execute_query_with_values(
        `SELECT id, username, password FROM accounts 
        WHERE username=$1`,
        [username]
      );

      const user: any = user_query[0];

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
    const _fakeDB = fakeDB;
    const user = _fakeDB.find((user: any) => user.id === payload.userId);
    if (!user)
      return res.status(404).json({
        success: false,
        message: "!user",
        accesstoken: "",
      });
    // console.log("user: ", user);
    // user exists, check if refreshtoken exists on user
    if (user.refreshtoken !== token) {
      // console.log("fakeDB: ", fakeDB);
      // console.log("user: ", user, " token: ", token);
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

    const userIndex = fakeDB.findIndex((entry: any) => entry.id == user.id);
    if (userIndex === -1)
      return res.status(404).send({
        success: false,
        message: "userIndex === -1",
        accesstoken: "",
      });
    fakeDB[userIndex] = {
      id: user.id,
      username: user.username,
      refreshtoken,
    };

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
