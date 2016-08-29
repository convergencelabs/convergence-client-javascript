import {ModelReference} from "./ModelReference";
import {ReferenceType} from "./ModelReference";
import {IndexTransformer} from "../ot/xform/reference/IndexTransformer";
import {RealTimeValue} from "../rt/RealTimeValue";

export class IndexReference extends ModelReference<number> {

  constructor(key: string,
              source: RealTimeValue<any>,
              username: string,
              sessionId: string,
              local: boolean) {
    super(ReferenceType.INDEX, key, source, username, sessionId, local);
  }

  _handleInsert(index: number, length: number): void {
    this._setIfChanged(IndexTransformer.handleInsert(this._values, index, length));
  }

  _handleRemove(index: number, length: number): void {
    this._setIfChanged(IndexTransformer.handleRemove(this._values, index, length));
  }

  _handleReorder(fromIndex: number, toIndex: number): void {
    this._setIfChanged(IndexTransformer.handleReorder(this._values, fromIndex, toIndex));
  }
}
