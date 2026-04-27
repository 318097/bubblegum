import { Router } from "express";
import errorHandlingWrapper from "../middleware/error-handling.js";
import fileStorage from "../utils/storage.js";
import { protectedRoute } from "../utils/authentication.js";
import userRoutes from "./user/user.routes.js";
import postRoutes from "./post/post.routes.js";
// const storeqRoutes = require("./storeq/storeq.routes");
import fireboardRoutes from "./fireboard/fireboard.routes.js";
import liquidRoutes from "./liquid/liquid.routes.js";
import notionRoutes from "./notion/notion.routes.js";
import dynamicRoutes from "./dynamic-routes/dynamic-routes.routes.js";
import ModulesModel from "../modules/modules/modules.model.js";
import TagsModel from "../modules/tags/tags.model.js";
import tagsMiddleware from "../modules/tags/tags.middleware.js";
import * as controller from "./api.controller.js";

const router = Router();

const tagRoutes = dynamicRoutes({
  Model: TagsModel,
  _customMiddleware: tagsMiddleware,
});

const moduleRoutes = dynamicRoutes({
  Model: ModulesModel,
});

router.get("/test", controller.test);
router.get("/error", errorHandlingWrapper(controller.testError));
router.get("/sendgrid", controller.sendgrid);

router.post("/send-email", errorHandlingWrapper(controller.sendEmail));
router.get("/products", errorHandlingWrapper(controller.getProducts));
router.get("/rssfeed", errorHandlingWrapper(controller.rssFeedParser));
router.post(
  "/upload",
  protectedRoute,
  fileStorage,
  errorHandlingWrapper(controller.fileUploadHandler),
);

router.use("/user", protectedRoute, userRoutes);
router.use("/posts", postRoutes);
router.use("/notion", notionRoutes);
router.use("/fireboard", protectedRoute, fireboardRoutes);

router.use("/liquid", liquidRoutes);

router.use("/tags", protectedRoute, tagRoutes);
router.use("/modules", protectedRoute, moduleRoutes);

export default router;
