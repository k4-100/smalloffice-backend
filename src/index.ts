import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import accountsRouter from "./routes/accounts";
import calcRouter from "./routes/calc";
import markdownPanelsRouter from "./routes/markdownPanels";
import { NODE_HOSTNAME, NODE_PORT } from "./common/constant";

const app = express();

console.log("INDEX");

app.use(compression({ filter: shouldCompress }));

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
// app.use(express.json());
app.use(express.json({ limit: "2mb" }));
// parse cookies
app.use(cookieParser());

function shouldCompress(req: Request, res: Response) {
  if (req.headers["x-no-compression"]) {
    // don't compress responses with this request header
    return false;
  }

  // fallback to standard filter function
  return compression.filter(req, res);
}

app.use("/accounts", accountsRouter);
app.use("/calc", calcRouter);
app.use("/markdown", markdownPanelsRouter);

app.all("*", (_req, res) => {
  res.status(404).json({
    success: false,
    message: "wrong route",
  });
});

app.listen(NODE_PORT, NODE_HOSTNAME, () => {
  console.log(`Listening at ${NODE_HOSTNAME}:${NODE_PORT}`);
});
