import {ModelReference} from "./ModelReference";
import {ReferenceType} from "./ModelReference";
import {IndexTransformer} from "../ot/xform/reference/IndexTransformer";
import {RealTimeElement} from "../rt/RealTimeElement";
import {ReferenceManager} from "./ReferenceManager";

export class IndexReference extends ModelReference<number> {

  constructor(referenceManager: ReferenceManager,
              key: string,
              source: RealTimeElement<any>,
              username: string,
              sessionId: string,
              local: boolean) {
    super(referenceManager, ReferenceType.INDEX, key, source, username, sessionId, local);
  }

  public _handleInsert(index: number, length: number): void {
    this._setIfChanged(IndexTransformer.handleInsert(this._values, index, length));
  }

  public _handleRemove(index: number, length: number): void {
    this._setIfChanged(IndexTransformer.handleRemove(this._values, index, length));
  }

  public _handleReorder(fromIndex: number, toIndex: number): void {
    this._setIfChanged(IndexTransformer.handleReorder(this._values, fromIndex, toIndex));
  }
}
