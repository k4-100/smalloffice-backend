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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const zlib_1 = __importDefault(require("zlib"));
const crypto_1 = __importDefault(require("crypto"));
let default_calc_table_content = "";
let default_calc_table_content_buf;
let default_calc_table_content_sha256 = "";
try {
    default_calc_table_content = fs_1.default.readFileSync(path_1.default.resolve("./assets/default_calc_table_content.txt"), "utf8");
    default_calc_table_content_sha256 = crypto_1.default
        .createHash("sha256")
        .update(default_calc_table_content, "utf8")
        .digest("hex");
    const inputBuffer = Buffer.from(default_calc_table_content);
    default_calc_table_content_buf = zlib_1.default.deflateSync(inputBuffer);
    default_calc_table_content_buf = inputBuffer;
}
catch (err) {
    console.error("FAILED TO LOAD DCTC ", err);
}
const accountsControllers = {
    register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username, password } = req.body;
            // check if user exists:
            let user_query = yield (0, psql_1.execute_query)(`SELECT username FROM accounts 
        WHERE username='${username}'`);
            if (user_query[0]) {
                return res.status(409).json({
                    success: false,
                    message: "account already exists",
                });
            }
            const hash = bcrypt_1.default.hashSync(password, 10);
            // insert user data:
            yield (0, psql_1.execute_query)(`INSERT INTO accounts(username,password) VALUES('${username}','${hash}' )`);
            // check if user was created properly:
            user_query = yield (0, psql_1.execute_query)(`SELECT id, username FROM accounts 
        WHERE username='${username}'`);
            if (!user_query[0].id)
                return res.status(500).json({
                    success: true,
                    message: "cannot select user for further account creation",
                });
            // add sheet
            yield (0, psql_1.execute_query)(`INSERT INTO calc_sheets(account_id) VALUES(${user_query[0].id})`);
            // check if user was created properly:
            const sheet_query = yield (0, psql_1.execute_query)(`SELECT id FROM calc_sheets 
        WHERE account_id=${user_query[0].id}`);
            if (!sheet_query[0].id)
                return res.status(500).json({
                    success: true,
                    message: "cannot select sheet for further account creation",
                });
            //     const query = `INSERT INTO calc_tables(calc_sheet_id, uncompressed_content_checksum, compressed_content)
            // VALUES(${
            //       sheet_query[0].id
            //     }, '${default_calc_table_content_sha256}',  E'\\x${default_calc_table_content_buf.toString(
            //       "hex"
            //     )}' )`;
            const query = `INSERT INTO calc_tables(calc_sheet_id, uncompressed_content_checksum, compressed_content) 
VALUES(${sheet_query[0].id}, '${default_calc_table_content_sha256}',  E'\\${default_calc_table_content_buf}' )`;
            for (let i = 0; i < 3; i++)
                yield (0, psql_1.execute_query)(query);
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
        // user exists, check if refreshtoken exists on user
        if (user.refreshtoken !== token) {
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
        const userIndex = fakeDB_1.default.findIndex((entry) => entry.id == user.id);
        if (userIndex === -1)
            return res.status(404).send({
                success: false,
                message: "userIndex === -1",
                accesstoken: "",
            });
        fakeDB_1.default[userIndex] = {
            id: user.id,
            username: user.username,
            refreshtoken,
        };
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