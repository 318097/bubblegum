import { Router } from "express";
import * as controller from "./circle.controller.js";
import * as businessController from "./business.controller.js";

const router = Router();
const businessRouter = Router();

router.get("/explore", controller.getExploreFeed);

router.get("/me/businesses", controller.getMyBusinessProfile);
router.get("/me/businesses/:id", controller.getMyBusinessProfileById);

router.get("/businesses/:businessId", controller.getBusinessById);
router.post("/businesses/:businessId", controller.createBusiness);
router.put("/businesses/:businessId", controller.updateBusiness);
router.delete("/businesses/:businessId", controller.deleteBusiness);

const registerContentRoutes = (resourceType) => {
  businessRouter.get(`/:businessId/${resourceType}`, (req, res) => {
    req.params.resourceType = resourceType;
    return businessController.listContent(req, res);
  });
  businessRouter.post(`/:businessId/${resourceType}`, (req, res) => {
    req.params.resourceType = resourceType;
    return businessController.createContent(req, res);
  });
  businessRouter.get(`/:businessId/${resourceType}/:contentId`, (req, res) => {
    req.params.resourceType = resourceType;
    return businessController.getContent(req, res);
  });
  businessRouter.patch(
    `/:businessId/${resourceType}/:contentId`,
    (req, res) => {
      req.params.resourceType = resourceType;
      return businessController.updateContent(req, res);
    },
  );
  businessRouter.put(`/:businessId/${resourceType}/:contentId`, (req, res) => {
    req.params.resourceType = resourceType;
    return businessController.updateContent(req, res);
  });
  businessRouter.delete(
    `/:businessId/${resourceType}/:contentId`,
    (req, res) => {
      req.params.resourceType = resourceType;
      return businessController.deleteContent(req, res);
    },
  );
};

["posts", "services", "offers", "faqs"].forEach(registerContentRoutes);

router.use("/businesses", businessRouter);

export default router;
