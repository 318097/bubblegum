import { AlbumModel, FilesModel } from "./photos/photos.model.js";
import { LynkCollectionModel, LynksModel } from "./links/links.model.js";
import { AlertAndMsgModel, ActivitiesModel } from "./alerts/alerts.model.js";
import UserModel from "../user/user.model.js";
import { EditablesModel, DynamicModel, HabitsModel } from "./liquid.model.js";

const modelEntityMap = {
  alerts: AlertAndMsgModel,
  activities: ActivitiesModel,
  editables: EditablesModel,
  dynamic: DynamicModel,
  links: LynkCollectionModel,
  habits: HabitsModel,
  photos: AlbumModel,
  user: UserModel,
  files: FilesModel,
  lynks: LynksModel,
};

export default modelEntityMap;
