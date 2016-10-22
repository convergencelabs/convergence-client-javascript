import {RealTimeValue} from "../rt/RealTimeValue";
import {ModelReference} from "./ModelReference";
import {ReferenceType} from "./ModelReference";
import {RangeTransformer} from "../ot/xform/reference/RangeTransformer";
import {ReferenceManager} from "./ReferenceManager";

export interface IndexRange {
  start: number;
  end: number;
}

export class RangeReference extends ModelReference<IndexRange> {

  constructor(referenceManager: ReferenceManager,
              key: string,
              source: RealTimeValue<any>,
              username: string,
              sessionId: string,
              local: boolean) {
    super(referenceManager, ReferenceType.RANGE, key, source, username, sessionId, local);
  }

  _handleInsert(index: number, length: number): void {
    this._setIfChanged(RangeTransformer.handleInsert(this._values, index, length));
  }

  _handleRemove(index: number, length: number): void {
    this._setIfChanged(RangeTransformer.handleRemove(this._values, index, length));
  }

  _handleReorder(fromIndex: number, toIndex: number): void {
    this._setIfChanged(RangeTransformer.handleReorder(this._values, fromIndex, toIndex));
  }
}
