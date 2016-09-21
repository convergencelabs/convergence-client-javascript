import {ModelReference} from "./ModelReference";
import {RealTimeValue} from "../rt/RealTimeValue";
export declare class IndexReference extends ModelReference<number> {
  constructor(key: string, source: RealTimeValue<any>, username: string, sessionId: string, local: boolean);

  _handleInsert(index: number, length: number): void;

  _handleRemove(index: number, length: number): void;

  _handleReorder(fromIndex: number, toIndex: number): void;
}
