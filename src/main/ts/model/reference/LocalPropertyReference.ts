import {LocalModelReference} from "./LocalModelReference";
import {ModelReferenceCallbacks} from "./LocalModelReference";
import {PropertyReference} from "./PropertyReference";

export class LocalPropertyReference extends LocalModelReference<string, PropertyReference> {
  constructor(reference: PropertyReference, referenceCallbacks: ModelReferenceCallbacks) {
    super(reference, referenceCallbacks);
  }
}
