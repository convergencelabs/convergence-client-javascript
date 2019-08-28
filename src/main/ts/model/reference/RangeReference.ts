import {RealTimeElement} from "../rt/RealTimeElement";
import {ModelReference} from "./ModelReference";
import {RangeTransformer} from "../ot/xform/reference/RangeTransformer";
import {ReferenceManager} from "./ReferenceManager";
import {DomainUser} from "../../identity";

/**
 * A single range to be used with a [[RangeReference]].
 *
 * For example, in
 * ```
 *  The quick brown fox jumped over the lazy dog
 * ```
 *
 * a selection of "fox jumped" would be represented with the range `{start: 16, end: 26}`
 */
export interface IndexRange {
  start: number;
  end: number;
}

/**
 * Represents a range of text in a [[RealTimeString]] that must be adjusted while
 * the data is changing.  See the
 * [developer guide](https://docs.convergence.io/guide/models/references/realtimestring.html)
 * for some examples.
 */
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
