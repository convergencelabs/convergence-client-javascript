import {RealTimeElement} from "../rt/RealTimeElement";
import {ModelReference} from "./ModelReference";
export declare class PropertyReference extends ModelReference<string> {
  constructor(key: string, source: RealTimeElement<any>, username: string, sessionId: string, local: boolean);

  _handlePropertyRemoved(property: string): void;
}
