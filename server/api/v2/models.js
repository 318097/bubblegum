import { AlbumModel, FilesModel } from "./photos/photos.model.js";
import { LynkCollectionModel, LynksModel } from "./links/links.model.js";
import { AlertAndMsgModel, ActivitiesModel } from "./alerts/alerts.model.js";
import { CircleModel } from "./circle/circle.model.js";
import { EditablesModel, HabitsModel } from "./liquid.model.js";
import config from "../../config.js";

let User;
if (config.DB_SOURCE === "CIRCLE") {
  User = await import("./user/user.model.js").then((mod) => mod.default);
} else {
  User = await import("./user/user.model.js").then((mod) => mod.default);
}

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
};

export default modelEntityMap;
