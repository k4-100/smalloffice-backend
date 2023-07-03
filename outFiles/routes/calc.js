"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const calc_1 = __importDefault(require("../controllers/calc"));
// import accountsControllers from "../controllers/accounts";
const calcRouter = express_1.default.Router();
// accountsRouter.post("/register", accountsControllers.register);
// accountsRouter.post("/login", accountsControllers.login);
// accountsRouter.post("/logout", accountsControllers.logout);
// accountsRouter.post("/refresh_token", accountsControllers.refresh_token);
calcRouter.post("/load", calc_1.default.load);
calcRouter.put("/save", calc_1.default.save);
exports.default = calcRouter;
//# sourceMappingURL=calc.js.map