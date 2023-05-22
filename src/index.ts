import express from "express";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { execute_query } from "./psql";

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
  const query_result: null | object = await execute_query(
    `SELECT username, password FROM accounts 
        WHERE username='${username}'`
  );

  // checks if user is in db
  if (!query_result) {
    res.status(400).json({
      success: false,
      message: "account doesn't exist",
    });
    return;
  }

  // checks if password matches
  const passwordMatches: boolean = bcrypt.compareSync(
    password,
    (query_result as any)[0].password as string
  );

  if (!passwordMatches) {
    res.status(403).json({
      success: false,
      message: "wrong credentials",
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: "logged successfully",
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
