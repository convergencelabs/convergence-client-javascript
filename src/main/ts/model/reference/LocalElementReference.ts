import {LocalModelReference, ModelReferenceCallbacks} from "./LocalModelReference";
import {ElementReference} from "./ElementReference";
import {RealTimeElement} from "../rt/";

/**
 * An [[ElementReference]] that was created locally. See [[RealTimeModel.elementReference]]
 */
export class LocalElementReference extends LocalModelReference<RealTimeElement<any>, ElementReference> {
  /**
   * @param reference
   * @param referenceCallbacks
   *
   * @hidden
   * @internal
   */
  constructor(reference: ElementReference, referenceCallbacks: ModelReferenceCallbacks) {
    super(reference, referenceCallbacks);
  }
}
