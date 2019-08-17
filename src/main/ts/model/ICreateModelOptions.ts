import {ModelPermissions} from "./ModelPermissions";
import {ModelDataInitializer} from "./ModelDataInitializer";

export interface ICreateModelOptions {
  /**
   * The collection in which this model will live.
   */
  collection: string;

  /**
   * The model's ID.  If not provided, a UUID will be generated.
   */
  id?: string;

  /**
   * The initial contents of the model, either provided directly or as the result
   * of a callback function.
   */
  data?: ModelDataInitializer;
  overrideCollectionWorldPermissions?: boolean;
  worldPermissions?: ModelPermissions;
  userPermissions?: { [key: string]: ModelPermissions };
}
