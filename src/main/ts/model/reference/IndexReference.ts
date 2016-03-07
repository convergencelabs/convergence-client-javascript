import {RealTimeValue} from "../RealTimeValue";
import {ModelReference} from "./ModelReference";
import {ReferenceType} from "./ModelReference";
import {IndexTransformer} from "../ot/xform/reference/IndexTransformer";

export class IndexReference extends ModelReference<number> {

  constructor(key: string,
              source: RealTimeValue<any>,
              userId: string,
              sessionId: string) {
    super(ReferenceType.INDEX, key, source, userId, sessionId);
  }

  handleInsert(index: number, length: number): void {
    this._setIfChanged(IndexTransformer.handleInsert([this._value], index, length)[0]);
  }


  handleRemove(index: number, length: number): void {
    this._setIfChanged(IndexTransformer.handleRemove([this._value], index, length)[0]);
  }

  handleReorder(fromIndex: number, toIndex: number): void {
    this._setIfChanged(IndexTransformer.handleReorder([this._value], fromIndex, toIndex)[0]);
  }

  private _setIfChanged(newIndex: number): void {
    if (this._value !== newIndex) {
      this._set(newIndex);
    }
  }
}
