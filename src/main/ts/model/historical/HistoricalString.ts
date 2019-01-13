import {HistoricalElement} from "./HistoricalElement";
import {StringNode} from "../internal/StringNode";
import {HistoricalWrapperFactory} from "./HistoricalWrapperFactory";
import {
  ObservableString,
  ObservableStringEvents,
  ObservableStringEventConstants
} from "../observable/ObservableString";
import {HistoricalModel} from "./HistoricalModel";

export interface HistoricalStringEvents extends ObservableStringEvents {
}

export class HistoricalString extends HistoricalElement<string> implements ObservableString {

  public static readonly Events: HistoricalStringEvents = ObservableStringEventConstants;

  /**
   * @hidden
   * @internal
   */
  constructor(delegate: StringNode, wrapperFactory: HistoricalWrapperFactory, model: HistoricalModel) {
    super(delegate, wrapperFactory, model);
  }

  public length(): number {
    return (this._delegate as StringNode).length();
  }
}
