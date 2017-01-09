import {HistoricalElement} from "./HistoricalElement";
import {HistoricalContainerElement} from "./HistoricalContainerElement";
import {ObservableObject, ObservableObjectEvents} from "../observable/ObservableObject";

export interface HistoricalObjectEvents extends ObservableObjectEvents {
}

export declare class HistoricalObject extends HistoricalElement<{[key: string]: any}>
  implements HistoricalContainerElement<{[key: string]: any}>, ObservableObject {

  public static readonly Events: HistoricalObjectEvents;

  public get(key: string): HistoricalElement<any>;

  public keys(): string[];

  public hasKey(key: string): boolean;

  public forEach(callback: (model: HistoricalElement<any>, key?: string) => void): void;

  public elementAt(pathArgs: any): HistoricalElement<any>;
}
