"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authUser = void 0;
const isAuth_1 = require("../common/isAuth");
// import { CustomRequest } from "../types/types";
const authUser = (req, res, next) => {
    req.userId = (0, isAuth_1.isAuth)(req);
    if (req.userId == null) {
        return res.status(500).json({
            success: false,
            message: "userID == null",
        });
    }
    next();
};
exports.authUser = authUser;
