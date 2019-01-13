import {HistoricalElement} from "./HistoricalElement";
import {UndefinedNode} from "../internal/UndefinedNode";
import {HistoricalWrapperFactory} from "./HistoricalWrapperFactory";
import {
  ObservableUndefined,
  ObservableUndefinedEvents,
  ObservableUndefinedEventConstants
} from "../observable/ObservableUndefined";
import {HistoricalModel} from "./HistoricalModel";

export interface HistoricalUndefinedEvents extends ObservableUndefinedEvents {
}

export class HistoricalUndefined extends HistoricalElement<void> implements ObservableUndefined {

  public static readonly Events: HistoricalUndefinedEvents = ObservableUndefinedEventConstants;

  /**
   * @hidden
   * @internal
   */
  constructor(delegate: UndefinedNode, wrapperFactory: HistoricalWrapperFactory, model: HistoricalModel) {
    super(delegate, wrapperFactory, model);
  }
}
