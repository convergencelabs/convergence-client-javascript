import {ClientOperationEvent} from "./ot/ClientOperationEvent";
import {IModelData} from "../storage/api";

/**
 * @hidden
 * @internal
 */
export interface IModelSnapshot {
  snapshot: IModelData;
  localOps: ClientOperationEvent[];
}
