import RealTimeValue from "../RealTimeValue";
import {ModelReference} from "./ModelReference";
import {ReferenceType} from "./ModelReference";
import {IndexTransformer} from "../ot/xform/reference/IndexTransformer";

export class IndexReference extends ModelReference {

  private _index: number;

  constructor(key: string,
              source: RealTimeValue<any>,
              userId: string,
              sessionId: string,
              index: number) {
    super(ReferenceType.INDEX, key, source, userId, sessionId);
    this._index = index;
  }

  handleInsert(index: number, length: number): void {
    this._setIfChanged(IndexTransformer.handleInsert([this._index], index, length)[0]);
  }


  handleRemove(index: number, length: number): void {
    this._setIfChanged(IndexTransformer.handleRemove([this._index], index, length)[0]);
  }

  handleReorder(fromIndex: number, toIndex: number): void {
    this._setIfChanged(IndexTransformer.handleReorder([this._index], fromIndex, toIndex)[0]);
  }

  index(): number {
    return this._index;
  }

  isSet(): boolean {
    return this._index !== null;
  }

  _set(index: number, local: boolean = false): void {
    this._index = index;
    this.emit(ModelReference.Events.CHANGED, {
      local: local
    });
  }

  _clear(): void {
    this._index = null;
    this.emit(ModelReference.Events.CLEARED, {});
  }

  private _setIfChanged(newIndex: number): void {
    if (this._index !== newIndex) {
      this._set(newIndex);
    }
  }
}
