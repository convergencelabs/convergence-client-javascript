import {ModelReferenceCallbacks, LocalModelReference} from "./LocalModelReference";
import {PropertyReference} from "./PropertyReference";

export class LocalPropertyReference extends LocalModelReference<string, PropertyReference> {

  /**
   * @param reference
   * @param referenceCallbacks
   *
   * @hidden
   * @internal
   */
  constructor(reference: PropertyReference, referenceCallbacks: ModelReferenceCallbacks) {
    super(reference, referenceCallbacks);
  }
}
