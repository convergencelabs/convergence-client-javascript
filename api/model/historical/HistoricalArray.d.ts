import {HistoricalElement} from "./HistoricalElement";
import {HistoricalContainerElement} from "./HistoricalContainerElement";
import {ObservableArray, ObservableArrayEvents} from "../observable/ObservableArray";
import {Path, PathElement} from "../";

export interface HistoricalArrayEvents extends ObservableArrayEvents {
}

export declare class HistoricalArray extends HistoricalElement<any[]>
  implements HistoricalContainerElement<any[]>, ObservableArray {

  public static readonly Events: HistoricalArrayEvents;

  public get(index: number): HistoricalElement<any>;

  public length(): number;

  public forEach(callback: (value: HistoricalElement<any>, index?: number) => void): void;

  public elementAt(path: Path): HistoricalElement<any>;
  public elementAt(...elements: PathElement[]): HistoricalElement<any>;
}
