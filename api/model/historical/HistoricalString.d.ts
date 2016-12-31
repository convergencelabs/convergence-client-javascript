import {HistoricalElement} from "./HistoricalElement";
import {ObservableString} from "../observable/ObservableString";

export declare class HistoricalString extends HistoricalElement<string> implements ObservableString {
  public length(): number;
}
