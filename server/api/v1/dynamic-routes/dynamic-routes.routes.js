import express from "express";
import controllerHOC from "./dynamic-routes.controller.js";

const dynamicRoutes = function (config) {
  const router = express.Router();

  const routes = ["GET", "POST", "PUT", "DELETE"];
  const controller = controllerHOC(config);

  routes.forEach((route) => {
    switch (route) {
      case "GET":
        router.get("/", controller.getAllEntities);
        router.get("/:id", controller.getEntityById);
        break;
      case "POST":
        router.post("/", controller.createEntity);
        router.post("/operations", controller.entityOperations);
        break;
      case "PUT":
        router.put("/:id", controller.updateEntity);
        break;
      case "DELETE":
        router.delete("/:id", controller.deleteEntity);
        break;
    }
  });

  return router;
};

export default dynamicRoutes;
