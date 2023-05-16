import express from "express";
import dotenv from "dotenv";

dotenv.config();

const { env } = process;

const NODE_HOSTNAME: string = env.NODE_HOSTNAME || "127.0.0.1";
const NODE_PORT: number = Number(env.NODE_PORT) || 5000;

const app = express();

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
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
