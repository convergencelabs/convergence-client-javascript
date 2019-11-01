import {HistoricalElement} from "./HistoricalElement";
import {StringNode} from "../internal/StringNode";
import {HistoricalWrapperFactory} from "./HistoricalWrapperFactory";
import {
  ObservableString,
  ObservableStringEvents,
  ObservableStringEventConstants
} from "../observable/ObservableString";
import {HistoricalModel} from "./HistoricalModel";

/**
 * @module RealTimeData
 */
export interface HistoricalStringEvents extends ObservableStringEvents {
}

/**
 * A read-only history-aware version of a [[RealTimeString]].  See [[HistoricalElement]]
 * and [[HistoricalModel]] for some common usages.
 *
 * @module RealTimeData
 */
export class HistoricalString extends HistoricalElement<string> implements ObservableString {

  public static readonly Events: HistoricalStringEvents = ObservableStringEventConstants;

  /**
   * @hidden
   * @internal
   */
  constructor(delegate: StringNode, wrapperFactory: HistoricalWrapperFactory, model: HistoricalModel) {
    super(delegate, wrapperFactory, model);
  }

  /**
   * The length of this string at the current version.
   *
   * @returns the length of this string
   */
  public length(): number {
    return (this._delegate as StringNode).length();
  }
}
