import {HistoricalElement} from "./HistoricalElement";
import {BooleanNode} from "../internal/BooleanNode";
import {HistoricalWrapperFactory} from "./HistoricalWrapperFactory";
import {
  ObservableBoolean,
  ObservableBooleanEvents,
  ObservableBooleanEventConstants
} from "../observable/ObservableBoolean";
import {HistoricalModel} from "./HistoricalModel";

/**
 * @module RealTimeData
 */
export interface HistoricalBooleanEvents extends ObservableBooleanEvents {
}

/**
 * A read-only history-aware version of a [[RealTimeBoolean]].  See [[HistoricalElement]]
 * and [[HistoricalModel]] for some common usages.
 *
 * @module RealTimeData
 */
export class HistoricalBoolean extends HistoricalElement<boolean> implements ObservableBoolean {

  public static readonly Events: HistoricalBooleanEvents = ObservableBooleanEventConstants;

  /**
   * @hidden
   * @internal
   */
  constructor(delegate: BooleanNode, wrapperFactory: HistoricalWrapperFactory, model: HistoricalModel) {
    super(delegate, wrapperFactory, model);
  }
}
