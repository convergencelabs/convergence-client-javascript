import {RealTimeObject} from "./RealTimeObject";
import {ModelReference} from "../reference/ModelReference";
import {RealTimeElement} from "./RealTimeElement";
import {Session} from "../../Session";
import {LocalElementReference} from "../reference/LocalElementReference";
import {ReferenceFilter} from "../reference/ReferenceFilter";
import {ConvergenceEventEmitter} from "../../util/ConvergenceEventEmitter";
import {ModelCollaborator} from "./ModelCollaborator";
import {ConvergenceEvent} from "../../util/ConvergenceEvent";
import {ObservableModel, ObservableModelEvents} from "../observable/ObservableModel";
import {ModelEvent} from "../modelEvents";
import {ModelPermissionManager} from "../ModelPermissionManager";
import {ModelPermissions} from "../ModelPermissions";
import {PathElement, Path} from "../";

export interface RealTimeModelEvents extends ObservableModelEvents {
  MODIFIED: string;
  COMMITTED: string;
  COLLABORATOR_OPENED: string;
  COLLABORATOR_CLOSED: string;
  REFERENCE: string;
  PERMISSIONS_CHANGED: string;
}

export declare class RealTimeModel extends ConvergenceEventEmitter<ConvergenceEvent> implements ObservableModel {

  public static readonly Events: RealTimeModelEvents;

  public session(): Session;

  public emitLocalEvents(): boolean;

  public emitLocalEvents(emit: boolean): void;

  public collaborators(): ModelCollaborator[];

  public collectionId(): string;

  public modelId(): string;

  public permissions(): ModelPermissions;

  public permissionsManager(): ModelPermissionManager;

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

  public root(): RealTimeObject;

  public elementAt(path: Path): RealTimeElement<any>;
  public elementAt(...elements: PathElement[]): RealTimeElement<any>;

  public isOpen(): boolean;

  public close(): Promise<void>;

  public startBatch(): void;

  /** @deprecated */
  public endBatch(): void;

  public completeBatch(): void;

  public batchSize(): number;

  public cancelBatch(): void;

  public isBatchStarted(): boolean;

  public elementReference(key: string): LocalElementReference;

  public reference(sessionId: string, key: string): ModelReference<any>;

  public references(filter?: ReferenceFilter): Array<ModelReference<any>>;
}
