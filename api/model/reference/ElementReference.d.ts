import {RealTimeElement} from "../rt/RealTimeElement";
import {ModelReference} from "./ModelReference";
import {RealTimeModel} from "../rt/RealTimeModel";
export declare class ElementReference extends ModelReference<RealTimeElement<any>> {
  private _detachedListener;

  constructor(key: string, source: RealTimeModel, username: string, sessionId: string, local: boolean);

  _set(values: RealTimeElement<any>[], local?: boolean): void;

  _clear(): void;

  _handleElementRemoved(element: RealTimeElement<any>): void;
}
