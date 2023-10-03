import express from "express";
import calcControllers from "../controllers/calc";

const calcRouter = express.Router();

calcRouter.post("/load", calcControllers.load);
calcRouter.put("/save", calcControllers.save);

export default calcRouter;
