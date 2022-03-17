const router = require("express").Router();
const errorHandlingWrapper = require("../../middleware/error-handling");
const { controllerHOC } = require("./dynamic-routes.controller");

module.exports = (config) => {
  const routes = ["GET", "POST", "PUT", "DELETE"];
  const controller = controllerHOC(config);

  routes.forEach((route) => {
    switch (route) {
      case "GET":
        router.get("/", errorHandlingWrapper(controller.getAllEntities));
        router.get("/:id", errorHandlingWrapper(controller.getEntityById));
        break;
      case "POST":
        router.post("/", errorHandlingWrapper(controller.createEntity));
        router.post(
          "/operations",
          errorHandlingWrapper(controller.entityOperations)
        );
        break;
      case "PUT":
        router.put("/:id", errorHandlingWrapper(controller.updateEntity));
        break;
      case "DELETE":
        router.delete("/:id", errorHandlingWrapper(controller.deleteEntity));
        break;
    }
  });

  return router;
};
