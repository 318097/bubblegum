const router = require("express").Router();
const errorHandlingWrapper = require("../middleware/error-handling");
const fileStorage = require("../utils/storage");
const { protectedRoute, transparent } = require("../utils/authentication");

const userRoutes = require("./user/user.routes");
const postRoutes = require("./post/post.routes");
// const storeqRoutes = require("./storeq/storeq.routes");
const fireboardRoutes = require("./fireboard/fireboard.routes");
const photosRoutes = require("./photos/photos.routes");
const fusionRoutes = require("./fusion/fusion.routes");
const notionRoutes = require("./notion/notion.routes");
const TagsModel = require("../modules/tags/tags.model");
const ModulesModel = require("../modules/modules/modules.model");
const controller = require("./api.controller");
const tagsMiddleware = require("../modules/tags/tags.middleware");

const dynamicRoutes = require("./dynamic-routes/dynamic-routes.routes");

const tagRoutes = dynamicRoutes({
  Model: TagsModel,
  _customMiddleware: tagsMiddleware,
});

const moduleRoutes = dynamicRoutes({
  Model: ModulesModel,
});

router.get("/test", controller.test);
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

router.use("/photos", photosRoutes);
router.use("/fusion", fusionRoutes);

router.use("/tags", protectedRoute, tagRoutes);
router.use("/modules", protectedRoute, moduleRoutes);

module.exports = router;
