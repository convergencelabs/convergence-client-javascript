import {ConvergenceEventEmitter} from "../../util/ConvergenceEventEmitter";
import {RealTimeObject} from "./RealTimeObject";
import {ModelReference} from "../reference/ModelReference";
import {RealTimeElement} from "./RealTimeElement";
import {RemoteSession} from "../../RemoteSession";
import {Session} from "../../Session";
import {LocalElementReference} from "../reference/LocalElementReference";
import {ReferenceFilter} from "../reference/ReferenceFilter";
import {ModelEvent} from "./events";

export declare class RealTimeModel extends ConvergenceEventEmitter {

  static Events: any;

  session(): Session;

  connectedSessions(): RemoteSession[]; // fixme name??

  collectionId(): string;

  modelId(): string;

  version(): number;

  createdTime(): Date;

  modifiedTime(): Date;
  
  root(): RealTimeObject;

  element(id: string): RealTimeElement<any>

  elementAt(path: any): RealTimeElement<any>;

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
