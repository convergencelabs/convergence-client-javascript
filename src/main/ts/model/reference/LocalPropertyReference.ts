import {LocalModelReference} from "./LocalModelReference";
import {ModelReferenceCallbacks} from "./LocalModelReference";
import {ReferenceDisposedCallback} from "./LocalModelReference";
import {PropertyReference} from "./PropertyReference";

export class LocalPropertyReference extends LocalModelReference<string, PropertyReference> {
  constructor(reference: PropertyReference, referenceCallbacks: ModelReferenceCallbacks, disposeCallback: ReferenceDisposedCallback) {
    super(reference, referenceCallbacks, disposeCallback);
  }
}
