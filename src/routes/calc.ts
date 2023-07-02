import express from "express";
import calcControllers from "../controllers/calc";
// import accountsControllers from "../controllers/accounts";

const calcRouter = express.Router();

// accountsRouter.post("/register", accountsControllers.register);

// accountsRouter.post("/login", accountsControllers.login);

// accountsRouter.post("/logout", accountsControllers.logout);

// accountsRouter.post("/refresh_token", accountsControllers.refresh_token);

calcRouter.post("/load", calcControllers.load);
calcRouter.put("/save", calcControllers.save);

export default calcRouter;
