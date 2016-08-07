import {Session} from "../../Session";
import {ConvergenceEvent} from "../../util/ConvergenceEvent";
import {ConvergenceEventEmitter} from "../../util/ConvergenceEventEmitter";
import {ObservableValue} from "./ObservableValue";
import {ObservableObject} from "./ObservableObject";


export interface ObservableModel extends ConvergenceEventEmitter {

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

export interface ConvergenceModelEvent extends ConvergenceEvent {
  src: ObservableModel;
}

export interface RealTimeModelClosedEvent extends ConvergenceModelEvent {
  local: boolean;
  reason?: string;
}

export interface VersionChangedEvent extends ConvergenceModelEvent {
  version: number;
}

export interface ValueDetachedEvent extends ConvergenceModelEvent {
  value: ObservableValue<any>;
}
