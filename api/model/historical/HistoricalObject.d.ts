import {HistoricalElement} from "./HistoricalElement";
import {HistoricalContainerElement} from "./HistoricalContainerElement";

export declare class HistoricalObject extends HistoricalElement<Map<string, any>> implements HistoricalContainerElement<Map<string, any>> {
  get(key: string): HistoricalElement<any>;

  keys(): string[];

  hasKey(key: string): boolean;

  forEach(callback: (model: HistoricalElement<any>, key?: string) => void): void;

  elementAt(pathArgs: any): HistoricalElement<any>;
}
