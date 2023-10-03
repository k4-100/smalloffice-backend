import express from "express";
import calcControllers from "../controllers/calc";
import { authUser } from "../middleware";

const calcRouter = express.Router();

calcRouter.use(authUser);

calcRouter.post("/load", calcControllers.load);
calcRouter.put("/save", calcControllers.save);

export default calcRouter;
