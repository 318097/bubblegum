import { AlbumModel, FilesModel } from "./photos/photos.model.js";
import UserModel from "../user/user.model.js";
import {
  AlertAndMsgModel,
  ActivitiesModel,
  EditablesModel,
  DynamicModel,
  LynkCollectionModel,
  LynksModel,
  HabitsModel,
} from "./fusion.model.js";

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
