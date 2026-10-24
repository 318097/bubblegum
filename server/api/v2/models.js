import { AlbumModel, FilesModel } from "./photos/photos.model.js";
import { LynkCollectionModel, LynksModel } from "./links/links.model.js";
import { AlertAndMsgModel, ActivitiesModel } from "./alerts/alerts.model.js";
import { CircleModel } from "./circle/circle.model.js";
import BusinessPostModel from "./circle/business-post.model.js";
import BusinessServiceModel from "./circle/business-service.model.js";
import BusinessOfferModel from "./circle/business-offer.model.js";
import BusinessFaqModel from "./circle/business-faq.model.js";
import { EditablesModel, HabitsModel } from "./liquid.model.js";
import User from "./user/user.model.js";

const modelEntityMap = {
  alerts: AlertAndMsgModel,
  activities: ActivitiesModel,
  editables: EditablesModel,
  links: LynkCollectionModel,
  habits: HabitsModel,
  photos: AlbumModel,
  user: User,
  files: FilesModel,
  lynks: LynksModel,
  circle: CircleModel,
  // Nested (not flat) so these aren't reachable through the generic
  // `/:entityType` CRUD routes, which would skip the business ownership check.
  businessContent: {
    posts: BusinessPostModel,
    services: BusinessServiceModel,
    offers: BusinessOfferModel,
    faqs: BusinessFaqModel,
  },
};

export default modelEntityMap;
