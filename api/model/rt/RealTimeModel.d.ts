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
   * The minimum version of the model. Normally 0 unless the history has been truncated.
   */
  minVersion(): number;

  /**
   * The maximum version available for this model.  Synonymous for version() for the
   * RealTimeModel
   */
  maxVersion(): number;

  /**
   * The current, latest time of the model.
   */
  time(): Date;

  /**
   * The minimum time of the model. Normally the created time unless the history has been truncated.
   */
  minTime(): Date;

  /**
   * The maximum time of the model, when it was last modified. Synonymous with time() for the
   * RealTimeModel.
   */
  maxTime(): Date;

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
