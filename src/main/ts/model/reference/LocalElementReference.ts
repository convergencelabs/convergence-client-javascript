import {LocalModelReference} from "./LocalModelReference";
import {ModelReferenceCallbacks} from "./LocalModelReference";
import {ElementReference} from "./ElementReference";
import {RealTimeElement} from "../rt/RealTimeElement";

export class LocalElementReference extends LocalModelReference<RealTimeElement<any>, ElementReference> {
  constructor(reference: ElementReference, referenceCallbacks: ModelReferenceCallbacks) {
    super(reference, referenceCallbacks);
  }
}
