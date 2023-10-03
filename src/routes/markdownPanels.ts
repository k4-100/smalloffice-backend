import express from "express";
import markdownPanelsControllers from "../controllers/markdownPanels";

const markdownPanelsRouter = express.Router();

markdownPanelsRouter.post("/load", markdownPanelsControllers.load);
markdownPanelsRouter.put("/save", markdownPanelsControllers.save);

export default markdownPanelsRouter;
