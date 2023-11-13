"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const calc_1 = __importDefault(require("../controllers/calc"));
const middleware_1 = require("../middleware");
const calcRouter = express_1.default.Router();
calcRouter.use(middleware_1.authUser);
calcRouter.post("/load", calc_1.default.load);
calcRouter.put("/save", calc_1.default.save);
exports.default = calcRouter;
