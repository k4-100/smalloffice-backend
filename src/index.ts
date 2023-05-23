import express from "express";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { execute_query } from "./psql";
import {
  createAccessToken,
  createRefreshToken,
  sendAccessToken,
  sendRefreshToken,
} from "./token";
import fakeDB from "./fakeDB";

dotenv.config();

const { env } = process;

const NODE_HOSTNAME: string = env.NODE_HOSTNAME || "127.0.0.1";
const NODE_PORT: number = Number(env.NODE_PORT) || 5000;

const app = express();

// handles cors
app.use(
  cors({
    origin: "http://localhost:4000",
    credentials: true,
  })
);

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));

// parse application/json
app.use(express.json());

// parse cookies
app.use(cookieParser());

app.get("/api/v1", (req, res) => {
  res.status(200).json({
    success: true,
    message: "api root",
  });
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  bcrypt.hash(password, 10, function (err, hash) {
    execute_query(
      `INSERT INTO accounts(username,password) VALUES('${username}','${hash}' )`
    );
  });

  res.status(200).json({
    success: true,
    message: "account created",
  });
});

app.post("/login", async (req, res) => {
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

    // 4. Put the refreshtoekn in the "database"
    user.refreshtoken = refreshtoken;
    const userIndex = fakeDB.findIndex((entry: any) => entry.id == user.id);
    if (userIndex === -1) fakeDB.push({ id: user.id, username: user.username });
    else fakeDB[userIndex] = { id: user.id, username: user.username };
    console.log(fakeDB);

    // 5. Send token. Refreshtoken as a cookie and accesstoken as a regular token
    sendRefreshToken(res, refreshtoken);
    sendAccessToken(res, req, accesstoken);

    // res.status(200).json({
    //   success: true,
    //   message: "logged successfully",
    // });
  } catch (err: any) {
    res.status(404).json({
      success: false,
      error: `${err.message}`,
    });
  }
});

app.post("/logout", (_req, res) => {
  res.clearCookie("refreshtoken", { path: "/refresh_token" });
  return res.status(200).json({
    success: true,
    message: "Logged out",
  });
});

app.all("*", (req, res) => {
  res.status(404).json({
    success: false,
  });
});

app.listen(NODE_PORT, NODE_HOSTNAME, () => {
  console.log(`Listening at ${NODE_HOSTNAME}:${NODE_PORT}`);
});
