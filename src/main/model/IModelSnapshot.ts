import {ClientOperationEvent} from "./ot/ClientOperationEvent";
import {IModelData} from "../storage/api";

/**
 * @hidden
 * @internal
 */
export interface IModelSnapshot {
  model: IModelData;
  localOps: ClientOperationEvent[];
}
