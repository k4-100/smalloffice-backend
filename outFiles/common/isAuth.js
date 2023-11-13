"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuth = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const { env } = process;
const isAuth = (req) => {
    const authorization = req.headers["authorization"];
    if (!authorization)
        throw new Error("You need to login");
    // 'Bearer TOKEN'
    const token = authorization.split(" ")[1];
    // const { userId } = verify(token, env.ACCESS_TOKEN_SECRET as any);
    const { userId } = (0, jsonwebtoken_1.verify)(token, env.ACCESS_TOKEN_SECRET);
    // const userId = 0;
    return userId;
};
exports.isAuth = isAuth;
