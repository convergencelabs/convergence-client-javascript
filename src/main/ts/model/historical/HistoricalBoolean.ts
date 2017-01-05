import {HistoricalElement} from "./HistoricalElement";
import {BooleanNode} from "../internal/BooleanNode";
import {HistoricalWrapperFactory} from "./HistoricalWrapperFactory";
import {
  ObservableBoolean,
  ObservableBooleanEvents,
  ObservableBooleanEventConstants
} from "../observable/ObservableBoolean";

export interface HistoricalBooleanEvents extends ObservableBooleanEvents {
}

export class HistoricalBoolean extends HistoricalElement<boolean> implements ObservableBoolean {

  public static readonly Events: HistoricalBooleanEvents = ObservableBooleanEventConstants;

  constructor(_delegate: BooleanNode, _wrapperFactory: HistoricalWrapperFactory) {
    super(_delegate, _wrapperFactory);
  }
}
