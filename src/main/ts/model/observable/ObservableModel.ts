import {Session} from "../../Session";
import {ConvergenceEvent} from "../../util/ConvergenceEvent";
import {ObservableValue} from "./ObservableValue";
import {ObservableObject} from "./ObservableObject";
import {RealTimeModel} from "../rt/RealTimeModel";


export interface ObservableModel {

  collectionId(): string;

  modelId(): string;

  version(): number;

  createdTime(): Date;

  modifiedTime(): Date;

  value(): ObservableObject;

  valueAt(path: any): ObservableValue<any>;

  session(): Session;

  close(): Promise<void>;

  isOpen(): boolean;
}

export interface ModelEvent extends ConvergenceEvent {
  src: RealTimeModel;
}

export interface ModelClosedEvent extends ModelEvent {
  local: boolean;
  reason?: string;
}

export interface VersionChangedEvent extends ModelEvent {
  version: number;
}
