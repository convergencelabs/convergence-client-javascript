import {RealTimeElement} from "../rt/RealTimeElement";
import {ModelReference} from "./ModelReference";
import {RangeTransformer} from "../ot/xform/reference/RangeTransformer";
import {ReferenceManager} from "./ReferenceManager";
import {DomainUser} from "../../identity";

export interface IndexRange {
  start: number;
  end: number;
}

export class RangeReference extends ModelReference<IndexRange> {

  /**
   * @param referenceManager
   * @param key
   * @param source
   * @param user
   * @param sessionId
   * @param local
   *
   * @hidden
   * @internal
   */
  constructor(referenceManager: ReferenceManager,
              key: string,
              source: RealTimeElement<any>,
              user: DomainUser,
              sessionId: string,
              local: boolean) {
    super(referenceManager, ModelReference.Types.RANGE, key, source, user, sessionId, local);
  }

  /**
   * @private
   * @hidden
   * @internal
   */
  public _handleInsert(index: number, length: number): void {
    this._setIfChanged(RangeTransformer.handleInsert(this._values, index, length), true);
  }

  /**
   * @private
   * @hidden
   * @internal
   */
  public _handleRemove(index: number, length: number): void {
    this._setIfChanged(RangeTransformer.handleRemove(this._values, index, length), true);
  }

  /**
   * @private
   * @hidden
   * @internal
   */
  public _handleReorder(fromIndex: number, toIndex: number): void {
    this._setIfChanged(RangeTransformer.handleReorder(this._values, fromIndex, toIndex), true);
  }
}
