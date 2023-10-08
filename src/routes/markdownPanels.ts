import express from "express";
import markdownPanelsControllers from "../controllers/markdownPanels";
import { authUser } from "../middleware";

const markdownPanelsRouter = express.Router();

markdownPanelsRouter.use(authUser);

markdownPanelsRouter.post("/load", markdownPanelsControllers.load);
markdownPanelsRouter.put("/save", markdownPanelsControllers.save);

export default markdownPanelsRouter;
