import {HistoricalElement} from "./HistoricalElement";
import {HistoricalContainerElement} from "./HistoricalContainerElement";
import {ObservableArray} from "../observable/ObservableArray";

export declare class HistoricalArray extends HistoricalElement<any[]>
  implements HistoricalContainerElement<any[]>, ObservableArray {

  public get(index: number): HistoricalElement<any>;

  public length(): number;

  public forEach(callback: (value: HistoricalElement<any>, index?: number) => void): void;

  public elementAt(pathArgs: any): HistoricalElement<any>;
}
