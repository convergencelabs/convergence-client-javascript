import {ConvergenceEventEmitter} from "../util/ConvergenceEventEmitter";
import {Session} from "../Session";
import {RealTimeModel} from "./rt/RealTimeModel";
import {HistoricalModel} from "./historical/HistoricalModel";
import {ModelResult} from "./query/ModelResult";
import {ConvergenceEvent} from "../util/ConvergenceEvent";
import {ModelPermissionManager} from "./ModelPermissionManager";
import {ModelPermissions} from "./ModelPermissions";

export declare class ModelService extends ConvergenceEventEmitter<ConvergenceEvent> {
  public session(): Session;

  public query(query: string): Promise<ModelResult[]>;

  public open(modelId: string): Promise<RealTimeModel>;

  public openAutoCreate(options: AutoCreateModelOptions): Promise<RealTimeModel>;

  public create(options: CreateModelOptions): Promise<string>;

  public remove(modelId: string): Promise<void>;

  public history(modelId: string): Promise<HistoricalModel>;

  public permissions(modelId: string): ModelPermissionManager;
}

export type ModelDataInitializer = {[key: string]: any} | (() => {[key: string]: any});

export interface AutoCreateModelOptions extends CreateModelOptions {
  ephemeral?: boolean;
}

export interface CreateModelOptions {
  collection: string;
  id?: string;
  data?: ModelDataInitializer;
  overrideWorld?: boolean;
  worldPermissions?: ModelPermissions;
  userPermissions?: {[key: string]: ModelPermissions};
}
