import {RealTimeObject} from "./RealTimeObject";
import {ModelReference} from "../reference/ModelReference";
import {RealTimeElement} from "./RealTimeElement";
import {Session} from "../../Session";
import {LocalElementReference} from "../reference/LocalElementReference";
import {ReferenceFilter} from "../reference/ReferenceFilter";
import {ModelEvent} from "./events";
import {ConvergenceEventEmitter} from "../../util/ConvergenceEventEmitter";
import {ModelCollaborator} from "./ModelCollaborator";

export declare class RealTimeModel extends ConvergenceEventEmitter<any> {

  static Events: any;

  session(): Session;

  collaborators(): ModelCollaborator[];

  collectionId(): string;

  modelId(): string;

  version(): number;

  time(): Date;

  minVersion(): number;

  createdTime(): Date;
  
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

export interface OpenedEvent extends ModelEvent {
  collaborator: ModelCollaborator;
}

export interface ClosedEvent extends ModelEvent {
  collaborator: ModelCollaborator;
}
