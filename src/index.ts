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
app.use(cors());

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));

// parse application/json
app.use(express.json());

// parse cookies
app.use(cookieParser());

app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  await bcrypt.hash(password, 10, function (err, hash) {
    execute_query(
      `INSERT INTO accounts(username,password) VALUES('${username}','${hash}' )`
    );
  });

  res.status(200).json({
    success: true,
    message: "account created",
  });
});

app.get("/login", async (req, res) => {
  const { username, password } = req.body;
  console.log("dasdas");
  const query_result: null | object = await execute_query(
    `SELECT username, password FROM accounts 
        WHERE username='${username}'`
  );

  console.log("query_result: ", query_result);
  console.log("password: ", password);

  if (!query_result) {
    res.status(400).json({
      success: true,
      message: "account doesn't exist",
    });
    return;
  }

  const passwordMatches: boolean = bcrypt.compareSync(
    password,
    (query_result as any)[0].password as string
  );

  if (!passwordMatches) {
    res.status(403).json({
      success: true,
      message: "wrong credentials",
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: "logged successfully",
  });
});

app.get("/api/v1", (req, res) => {
  res.status(200).json({
    success: true,
    message: "api root",
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
