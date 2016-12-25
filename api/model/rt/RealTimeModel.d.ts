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

  public static Events: any;

  public session(): Session;

  public collaborators(): ModelCollaborator[];

  public collectionId(): string;

  public modelId(): string;

  /**
   * The current, latest version of the model.
   */
  public version(): number;

  /**
   * The minimum version of the model. Normally 0 unless the history has been truncated.
   */
  public minVersion(): number;

  /**
   * The maximum version available for this model.  Synonymous for version() for the
   * RealTimeModel
   */
  public maxVersion(): number;

  /**
   * The current, latest time of the model.
   */
  public time(): Date;

  /**
   * The minimum time of the model. Normally the created time unless the history has been truncated.
   */
  public minTime(): Date;

  /**
   * The maximum time of the model, when it was last modified. Synonymous with time() for the
   * RealTimeModel.
   */
  public maxTime(): Date;

  /**
   * The time the model was created.
   */
  public createdTime(): Date;

  public root(): RealTimeObject;

  public element(id: string): RealTimeElement<any>

  public elementAt(path: any): RealTimeElement<any>;

  public isOpen(): boolean;

  public close(): Promise<void>;

  public startBatch(): void;

  public endBatch(): void;

  public isBatchStarted(): boolean;

  public elementReference(key: string): LocalElementReference;

  public reference(sessionId: string, key: string): ModelReference<any>;

  public references(filter?: ReferenceFilter): ModelReference<any>[];
}

export interface OpenedEvent extends ModelEvent {
  collaborator: ModelCollaborator;
}

export interface ClosedEvent extends ModelEvent {
  collaborator: ModelCollaborator;
}
