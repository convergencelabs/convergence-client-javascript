import {HistoricalValue} from "./HistoricalValue";
import {HistoricalContainerValue} from "./HistoricalContainerValue";

export declare class HistoricalArray extends HistoricalValue<any[]> implements HistoricalContainerValue<any[]> {
  get(index: number): HistoricalValue<any>;

  length(): number;

  forEach(callback: (value: HistoricalValue<any>, index?: number) => void): void;

  elementAt(pathArgs: any): HistoricalValue<any>;
}
