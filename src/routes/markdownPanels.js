"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const markdownPanels_1 = __importDefault(require("../controllers/markdownPanels"));
const middleware_1 = require("../middleware");
const markdownPanelsRouter = express_1.default.Router();
markdownPanelsRouter.use(middleware_1.authUser);
markdownPanelsRouter.post("/load", markdownPanels_1.default.load);
markdownPanelsRouter.put("/save", markdownPanels_1.default.save);
exports.default = markdownPanelsRouter;
