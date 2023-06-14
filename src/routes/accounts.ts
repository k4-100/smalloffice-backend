import express from "express";
import accountsControllers from "../controllers/accounts";

const accountsRouter = express.Router();

accountsRouter.post("/register", accountsControllers.register);

accountsRouter.post("/login", accountsControllers.login);

accountsRouter.post("/logout", accountsControllers.logout);

accountsRouter.post("/refresh_token", accountsControllers.refresh_token);

export default accountsRouter;
