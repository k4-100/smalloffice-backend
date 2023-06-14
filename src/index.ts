import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { isAuth } from "./common/isAuth";
import accountsRouter from "./routes/accounts";

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

app.all("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "wrong route",
  });
});

app.listen(NODE_PORT, NODE_HOSTNAME, () => {
  console.log(`Listening at ${NODE_HOSTNAME}:${NODE_PORT}`);
});
