import {ConvergenceEventEmitter} from "../../util/ConvergenceEventEmitter";
import {RealTimeObject} from "./RealTimeObject";
import {ModelReference} from "../reference/ModelReference";
import {RealTimeValue} from "./RealTimeValue";
import {RemoteSession} from "../../RemoteSession";
import {Session} from "../../Session";
import {LocalElementReference} from "../reference/LocalElementReference";
import {ReferenceFilter} from "../reference/ReferenceFilter";
import {ModelEvent} from "./events";

export declare class RealTimeModel extends ConvergenceEventEmitter {

  static Events: any;

  connectedSessions(): RemoteSession[]; // fixme rename to sessions
  collectionId(): string;

  modelId(): string;

  version(): number;

  createdTime(): Date;

  modifiedTime(): Date;
  
  root(): RealTimeObject;

  elementAt(path: any): RealTimeValue<any>;

  session(): Session;

  isOpen(): boolean;

  close(): Promise<void>;

  startBatch(): void;

  endBatch(): void;

  isBatchStarted(): boolean;

  elementReference(key: string): LocalElementReference;

  reference(sessionId: string, key: string): ModelReference<any>;

  references(filter?: ReferenceFilter): ModelReference<any>[];
}

// fixme how do we use these.
export interface RemoteSessionOpenedEvent extends ModelEvent {
  username: string;
  sessionId: string;
}

export interface RemoteSessionClosedEvent extends ModelEvent {
  username: string;
  sessionId: string;
}
