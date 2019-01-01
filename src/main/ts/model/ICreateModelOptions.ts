import {ModelPermissions} from "./ModelPermissions";
import {ModelDataInitializer} from "./ModelDataInitializer";

export interface ICreateModelOptions {
  collection: string;
  id?: string;
  data?: ModelDataInitializer;
  overrideCollectionWorldPermissions?: boolean;
  worldPermissions?: ModelPermissions;
  userPermissions?: { [key: string]: ModelPermissions };
}
