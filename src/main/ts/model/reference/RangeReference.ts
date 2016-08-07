import {RealTimeValue} from "../rt/RealTimeValue";
import {ModelReference} from "./ModelReference";
import {ReferenceType} from "./ModelReference";
import {IndexTransformer} from "../ot/xform/reference/IndexTransformer";

export interface IndexRange {
  start: number;
  end: number;
}

export class RangeReference extends ModelReference<IndexRange> {

  constructor(key: string,
              source: RealTimeValue<any>,
              username: string,
              sessionId: string,
              local: boolean) {
    super(ReferenceType.RANGE, key, source, username, sessionId, local);
  }

  _handleInsert(index: number, length: number): void {
    var xformed: number[] = IndexTransformer.handleInsert([this._value.start, this._value.end], index, length);
    this._setIfChanged({start: xformed[0], end: xformed[1]});
  }


  _handleRemove(index: number, length: number): void {
    var xformed: number[] = IndexTransformer.handleRemove([this._value.start, this._value.end], index, length);
    this._setIfChanged({start: xformed[0], end: xformed[1]});
  }

  _handleReorder(fromIndex: number, toIndex: number): void {
    var xformed: number[] = IndexTransformer.handleReorder([this._value.start, this._value.end], fromIndex, toIndex);
    this._setIfChanged({start: xformed[0], end: xformed[1]});
  }
}
