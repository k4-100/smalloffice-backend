"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const accounts_1 = __importDefault(require("./routes/accounts"));
dotenv_1.default.config();
const { env } = process;
const NODE_HOSTNAME = env.NODE_HOSTNAME || "127.0.0.1";
const NODE_PORT = Number(env.NODE_PORT) || 5000;
const app = (0, express_1.default)();
// handles cors
app.use((0, cors_1.default)({
    origin: "http://localhost:5173",
    credentials: true,
}));
// parse application/x-www-form-urlencoded
app.use(express_1.default.urlencoded({ extended: false }));
// parse application/json
app.use(express_1.default.json());
// parse cookies
app.use((0, cookie_parser_1.default)());
app.use("/accounts", accounts_1.default);
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
//# sourceMappingURL=index.js.map