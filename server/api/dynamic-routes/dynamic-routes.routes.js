import express from "express";
import errorHandlingWrapper from "../../middleware/error-handling.js";
import controllerHOC from "./dynamic-routes.controller.js";

const dynamicRoutes = function (config) {
  const router = express.Router();

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
          errorHandlingWrapper(controller.entityOperations),
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

export default dynamicRoutes;
