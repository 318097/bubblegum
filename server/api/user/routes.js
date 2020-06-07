const router = require("express").Router();
const controller = require("./controller");
const { protected } = require("../../auth/auth");
const errorHandlingWrapper = require("../../middleware/errorHandling");

router.get("/", controller.getAll);
router.put("/:id", protected, controller.updateUser);
router.post("/", controller.createUser);
router.delete("/:id", protected, controller.deleteUser);

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

module.exports = router;
