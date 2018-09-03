import {ModelReference} from "./ModelReference";
import {IndexTransformer} from "../ot/xform/reference/IndexTransformer";
import {RealTimeElement} from "../rt/";
import {ReferenceManager} from "./ReferenceManager";

export class IndexReference extends ModelReference<number> {

  /**
   * @param referenceManager
   * @param key
   * @param source
   * @param username
   * @param sessionId
   * @param local
   *
   * @hidden
   * @internal
   */
  constructor(referenceManager: ReferenceManager,
              key: string,
              source: RealTimeElement<any>,
              username: string,
              sessionId: string,
              local: boolean) {
    super(referenceManager, ModelReference.Types.INDEX, key, source, username, sessionId, local);
  }

  /**
   * @private
   * @hidden
   * @internal
   */
  public _handleInsert(index: number, length: number): void {
    this._setIfChanged(IndexTransformer.handleInsert(this._values, index, length));
  }

  /**
   * @private
   * @hidden
   * @internal
   */
  public _handleRemove(index: number, length: number): void {
    this._setIfChanged(IndexTransformer.handleRemove(this._values, index, length));
  }

  /**
   * @private
   * @hidden
   * @internal
   */
  public _handleReorder(fromIndex: number, toIndex: number): void {
    this._setIfChanged(IndexTransformer.handleReorder(this._values, fromIndex, toIndex));
  }
}
