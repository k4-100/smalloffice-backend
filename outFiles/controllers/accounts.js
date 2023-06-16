"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const token_1 = require("../common/token");
const fakeDB_1 = __importDefault(require("../models/fakeDB"));
const psql_1 = require("../models/psql");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const accountsControllers = {
    register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username, password } = req.body;
            const user_query = yield (0, psql_1.execute_query)(`SELECT username FROM accounts 
        WHERE username='${username}'`);
            if (user_query[0]) {
                return res.status(409).json({
                    success: false,
                    message: "account already exists",
                });
            }
            bcrypt_1.default.hash(password, 10, function (err, hash) {
                (0, psql_1.execute_query)(`INSERT INTO accounts(username,password) VALUES('${username}','${hash}' )`);
            });
            res.status(200).json({
                success: true,
                message: "account created",
            });
        });
    },
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username, password } = req.body;
            try {
                const user_query = yield (0, psql_1.execute_query)(`SELECT id, username, password FROM accounts 
        WHERE username='${username}'`);
                const user = user_query[0];
                console.log("user: ", user);
                // checks if user is in db
                if (!user) {
                    res.status(400).json({
                        success: false,
                        message: "account doesn't exist",
                    });
                    return;
                }
                // checks if password matches
                const passwordMatches = bcrypt_1.default.compareSync(password, user.password);
                if (!passwordMatches) {
                    res.status(403).json({
                        success: false,
                        message: "wrong credentials",
                    });
                    return;
                }
                // 3. Create Refresh- and Accesstoken
                const accesstoken = (0, token_1.createAccessToken)(user.id);
                const refreshtoken = (0, token_1.createRefreshToken)(user.id);
                console.log("refreshtoken: ", refreshtoken);
                user.refreshtoken = refreshtoken;
                const userIndex = fakeDB_1.default.findIndex((entry) => entry.id == user.id);
                if (userIndex === -1)
                    fakeDB_1.default.push({ id: user.id, username: user.username, refreshtoken });
                else
                    fakeDB_1.default[userIndex] = {
                        id: user.id,
                        username: user.username,
                        refreshtoken,
                    };
                console.log("fakeDB", fakeDB_1.default);
                (0, token_1.sendRefreshToken)(res, refreshtoken);
                (0, token_1.sendAccessToken)(res, req, accesstoken, user.id, user.username);
            }
            catch (err) {
                res.status(404).json({
                    success: false,
                    error: `${err.message}`,
                });
            }
        });
    },
    logout(_req, res) {
        res.clearCookie("refreshtoken", { path: "/accounts/refresh_token" });
        return res.status(200).json({
            success: true,
            message: "Logged out",
        });
    },
    refresh_token(req, res) {
        const token = req.cookies.refreshtoken;
        console.log("cookies: ", req.cookies);
        // if there is no token in request
        if (!token)
            return res.status(403).json({
                success: false,
                message: "!token",
                accesstoken: "",
            });
        // We have a token, time to verify it
        let payload = null;
        try {
            payload = jsonwebtoken_1.default.verify(token, process.env.REFRESH_TOKEN_SECRET);
        }
        catch (err) {
            return res.status(404).json({
                success: false,
                message: "err",
                accesstoken: "",
            });
        }
        //token is valid, check if user exist
        const _fakeDB = fakeDB_1.default;
        const user = _fakeDB.find((user) => user.id === payload.userId);
        if (!user)
            return res.status(404).json({
                success: false,
                message: "!user",
                accesstoken: "",
            });
        console.log("user: ", user);
        // user exists, check if refreshtoken exists on user
        if (user.refreshtoken !== token) {
            // console.log("user: ", user, " token: ", token);
            return res.status(403).send({
                success: false,
                message: "user.refreshtoken !== token",
                accesstoken: "",
            });
        }
        // token exists, create new Refresh and Access token
        const accesstoken = (0, token_1.createAccessToken)(user.id);
        const refreshtoken = (0, token_1.createRefreshToken)(user.id);
        // update refreshtoken on user in db
        // Could have different versions instead
        user.refreshtoken = refreshtoken;
        // All good to go, send new refreshtoken and accesstoken
        (0, token_1.sendRefreshToken)(res, refreshtoken);
        return res.status(200).send({
            success: true,
            message: "finished",
            accesstoken,
        });
    },
    //
};
exports.default = accountsControllers;
//# sourceMappingURL=accounts.js.map