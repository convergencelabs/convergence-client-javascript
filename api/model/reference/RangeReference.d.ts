import {RealTimeElement} from "../rt/RealTimeElement";
import {ModelReference} from "./ModelReference";
export interface IndexRange {
  start: number;
  end: number;
}
export declare class RangeReference extends ModelReference<IndexRange> {
  constructor(key: string, source: RealTimeElement<any>, username: string, sessionId: string, local: boolean);

  _handleInsert(index: number, length: number): void;

  _handleRemove(index: number, length: number): void;

  _handleReorder(fromIndex: number, toIndex: number): void;
}
