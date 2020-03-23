const router = require("express").Router();
const controller = require("./controller");
const { protected } = require("../../auth/auth");
const errorHandlingWrapper = require("../../middleware/errorHandling");

// router.param("id", (req, res, next) => {
// Middleware for routes which contain id param.
// console.log("param route...");
// next();
// });

router.get("/me", protected, controller.me);
router.get("/:username/resume", controller.getResume);
router.get("/", controller.getAll);
router.get("/:id", protected, controller.getOne);
router.get(
  "/:id/settings",
  protected,
  errorHandlingWrapper(controller.getSettings)
);

router.put(
  "/:id/settings",
  protected,
  errorHandlingWrapper(controller.updateSettings)
);
router.put("/resume", protected, controller.updateResume);
router.put("/:id", protected, controller.update);

router.post("/", controller.create);
router.delete("/:id", protected, controller.delete);

module.exports = router;
