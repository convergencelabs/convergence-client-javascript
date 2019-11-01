import {ConvergenceSession} from "../../ConvergenceSession";
import {ObservableObject} from "./ObservableObject";
import {ObservableElement} from "./ObservableElement";

/**
 * The events that could be emitted by a [[RealTimeModel]] or [[HistoricalModel]].
 *
 * @module RealTimeData
 */
export interface ObservableModelEvents {
  /**
   * Emitted when a model is closed locally. The actual event emitted is a [[ModelClosedEvent]].
   *
   * @event
   */
  readonly CLOSED: string;

  /**
   * Emitted when a model is deleted. The actual event emitted is a [[ModelDeletedEvent]].
   *
   * @event
   */
  readonly DELETED: string;

  /**
   * Emitted when the version of this model changes.  This could happen from
   * a local or remote change to this model. The actual emitted event is a [[VersionChangedEvent]].
   *
   * @event
   */
  readonly VERSION_CHANGED: string;
}

/**
 * @module RealTimeData
 */
export const ObservableModelEventConstants: ObservableModelEvents = {
  CLOSED: "closed",
  DELETED: "deleted",
  VERSION_CHANGED: "version_changed"
};
Object.freeze(ObservableModelEventConstants);

/**
 * @module RealTimeData
 */
export interface ObservableModel {

  session(): ConvergenceSession;

  collectionId(): string;

  modelId(): string;

  time(): Date;

  minTime(): Date;

  maxTime(): Date;

  createdTime(): Date;

  version(): number;

  minVersion(): number;

  maxVersion(): number;

  root(): ObservableObject;

  elementAt(path: any): ObservableElement<any>;
}
