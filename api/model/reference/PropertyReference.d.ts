import {RealTimeValue} from "../rt/RealTimeValue";
import {ModelReference} from "./ModelReference";
export declare class PropertyReference extends ModelReference<string> {
  constructor(key: string, source: RealTimeValue<any>, username: string, sessionId: string, local: boolean);

  _handlePropertyRemoved(property: string): void;
}
