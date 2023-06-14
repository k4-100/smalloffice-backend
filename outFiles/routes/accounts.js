"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const accounts_1 = __importDefault(require("../controllers/accounts"));
const accountsRouter = express_1.default.Router();
accountsRouter.post("/register", accounts_1.default.register);
accountsRouter.post("/login", accounts_1.default.login);
accountsRouter.post("/logout", accounts_1.default.logout);
accountsRouter.post("/refresh_token", accounts_1.default.refresh_token);
exports.default = accountsRouter;
//# sourceMappingURL=accounts.js.map