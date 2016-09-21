import {HistoricalValue} from "./HistoricalValue";

export declare class HistoricalObject extends HistoricalValue<Map<string, any>> {
  get(key: string): HistoricalValue<any>;

  keys(): string[];

  hasKey(key: string): boolean;

  forEach(callback: (model: HistoricalValue<any>, key?: string) => void): void;

  elementAt(pathArgs: any): HistoricalValue<any>;
}
