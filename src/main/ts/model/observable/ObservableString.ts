import {ObservableElement, ObservableElementEvents, ObservableElementEventConstants} from "./ObservableElement";

/**
 * The events that could be emitted by a [[RealTimeString]] or [[HistoricalString]].
 *
 * @module RealTimeData
 */
export interface ObservableStringEvents extends ObservableElementEvents {
  /**
   * Emitted when zero or more characters are [[RealTimeString.insert|inserted]] into a [[RealTimeString]].
   * See [[StringInsertEvent]] for the actual emitted event.
   *
   * @event
   */
  readonly INSERT: string;

  /**
   * Emitted when characters are [[RealTimeString.remove|removed]] on a [[RealTimeString]].
   * See [[StringRemoveEvent]] for the actual emitted event.
   *
   * @event
   */
  readonly REMOVE: string;

  /**
   * Emitted when the entire [[RealTimeString.value|value]] of a [[RealTimeString]] is set,
   * meaning its entire contents were replaced (or initially set).
   * See [[StringSetValueEvent]] for the actual emitted event.
   *
   * @event
   */
  readonly VALUE: string;
}

/**
 * @module RealTimeData
 */
export const ObservableStringEventConstants: ObservableStringEvents = {
  INSERT: "insert",
  REMOVE: "remove",
  ...ObservableElementEventConstants
};
Object.freeze(ObservableStringEventConstants);

/**
 * @module RealTimeData
 */
export interface ObservableString extends ObservableElement<string> {
  length(): number;
}
