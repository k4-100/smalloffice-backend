"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendRefreshToken = exports.sendAccessToken = exports.createRefreshToken = exports.createAccessToken = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const createAccessToken = (userId) => {
    return (0, jsonwebtoken_1.sign)({ userId }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "30m",
    });
};
exports.createAccessToken = createAccessToken;
const createRefreshToken = (userId) => {
    return (0, jsonwebtoken_1.sign)({ userId }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "1d",
    });
};
exports.createRefreshToken = createRefreshToken;
const sendAccessToken = (res, req, accesstoken, id, username) => {
    res.status(200).send({
        success: true,
        id,
        username,
        accesstoken,
        // email: req.body.email,
    });
};
exports.sendAccessToken = sendAccessToken;
const sendRefreshToken = (res, refreshtoken) => {
    // console.table(["rt in sendRefreshToken: ", refreshtoken]);
    res.cookie("refreshtoken", refreshtoken, {
        // httpOnly: true,
        httpOnly: true,
        path: "/accounts/refresh_token",
    });
};
exports.sendRefreshToken = sendRefreshToken;
//# sourceMappingURL=token.js.map