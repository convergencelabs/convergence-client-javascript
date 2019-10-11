import {ModelReferenceCallbacks, LocalModelReference} from "./LocalModelReference";
import {RangeReference, IndexRange} from "./RangeReference";

/**
 * A [[RangeReference]] that was created locally. See [[RealTimeString.rangeReference]]
 *
 * @category Collaboration Awareness
 */
export class LocalRangeReference extends LocalModelReference<IndexRange, RangeReference> {

  /**
   * @param reference
   * @param referenceCallbacks
   *
   * @hidden
   * @internal
   */
  constructor(reference: RangeReference, referenceCallbacks: ModelReferenceCallbacks) {
    super(reference, referenceCallbacks);
  }
}
