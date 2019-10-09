import {ModelReferenceCallbacks, LocalModelReference} from "./LocalModelReference";
import {IndexReference} from "./IndexReference";

/**
 * An [[IndexReference]] that was created locally. See [[RealTimeString.indexReference]]
 *
 * @category Collaboration Awareness
 */
export class LocalIndexReference extends LocalModelReference<number, IndexReference> {
  /**
   * @param reference
   * @param referenceCallbacks
   *
   * @hidden
   * @internal
   */
  constructor(reference: IndexReference, referenceCallbacks: ModelReferenceCallbacks) {
    super(reference, referenceCallbacks);
  }
}
