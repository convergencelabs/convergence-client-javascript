import {ObservableElement, ObservableElementEvents} from "./ObservableElement";
export {ObservableElementEventConstants as ObservableDateEventConstants} from "./ObservableElement";

/**
 * The events that could be emitted by a [[RealTimeDate]] or [[HistoricalDate]].
 */
export interface ObservableDateEvents extends ObservableElementEvents {
  /**
   * Emitted when the entire [[RealTimeDate.value|value]] of a [[RealTimeDate]] is set,
   * meaning its entire contents were replaced (or initially set).
   * See [[DateSetValueEvent]] for the actual emitted event.
   *
   * @event
   */
  readonly VALUE: string;
}

export interface ObservableDate extends ObservableElement<Date> {

}
