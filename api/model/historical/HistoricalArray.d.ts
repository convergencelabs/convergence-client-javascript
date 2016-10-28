import {HistoricalElement} from "./HistoricalElement";
import {HistoricalContainerElement} from "./HistoricalContainerElement";

export declare class HistoricalArray extends HistoricalElement<any[]> implements HistoricalContainerElement<any[]> {
  get(index: number): HistoricalElement<any>;

  length(): number;

  forEach(callback: (value: HistoricalElement<any>, index?: number) => void): void;

  elementAt(pathArgs: any): HistoricalElement<any>;
}
