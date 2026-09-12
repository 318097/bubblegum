import { Router } from "express";
import * as controller from "./circle.controller.js";

const router = Router();

/* 
  /feed - Fetches the feed for updates, posts, etc for the consumer
  /explore - Fetches the business profile feed for the consumer
  
  /me - Fetches the profile details for my business
  /me/posts - Fetches the posts of my business for the consumer
  /me/services
  /me/offers
  /me/faqs

  Business Profiles
  /profile/:id - Fetches the business profile by ID for the consumer
  /profile/:id/posts - Fetches the posts of the business profile by ID for the consumer
  /profile/:id/services - Fetches the services of the business profile by ID for the consumer
  /profile/:id/offers - Fetches the offers of the business profile by ID for the consumer
  /profile/:id/faqs - Fetches the FAQs of the business profile by ID for the consumer
*/

router.get("/explore", controller.getExploreFeed);
router.get("/me", controller.getMyBusinessProfile);
router.get("/profile/:circleId", controller.getBusinessById);

router.post("/", controller.createBusinessEntity);
router.put("/:circleId", controller.updateBusinessEntity);
router.delete("/:circleId", controller.deleteBusinessEntity);

export default router;
