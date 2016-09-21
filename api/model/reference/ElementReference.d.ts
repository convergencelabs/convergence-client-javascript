import {RealTimeValue} from "../rt/RealTimeValue";
import {ModelReference} from "./ModelReference";
import {RealTimeModel} from "../rt/RealTimeModel";
export declare class ElementReference extends ModelReference<RealTimeValue<any>> {
  private _detachedListener;

  constructor(key: string, source: RealTimeModel, username: string, sessionId: string, local: boolean);

  _set(values: RealTimeValue<any>[], local?: boolean): void;

  _clear(): void;

  _handleElementRemoved(element: RealTimeValue<any>): void;
}
