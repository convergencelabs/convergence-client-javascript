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

  /**
   * The current, latest version of the model.
   */
  version(): number;

  /**
   * The current, latest time of the model.
   */
  time(): Date;

  /**
   * The minimum version of the model. Normally 0 unless the history has been truncated.
   */
  minVersion(): number;

  /**
   * The time the model was created.
   */
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
