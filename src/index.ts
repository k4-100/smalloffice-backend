import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import accountsRouter from "./routes/accounts";
import calcRouter from "./routes/calc";

dotenv.config();

const { env } = process;

const NODE_HOSTNAME: string = env.NODE_HOSTNAME || "127.0.0.1";
const NODE_PORT: number = Number(env.NODE_PORT) || 5000;

const app = express();

// handles cors
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));

// parse application/json
app.use(express.json());

// parse cookies
app.use(cookieParser());

app.use("/accounts", accountsRouter);
app.use("/calc", calcRouter);

app.all("*", (_req, res) => {
  res.status(404).json({
    success: false,
    message: "wrong route",
  });
});

app.listen(NODE_PORT, NODE_HOSTNAME, () => {
  console.log(`Listening at ${NODE_HOSTNAME}:${NODE_PORT}`);
});
