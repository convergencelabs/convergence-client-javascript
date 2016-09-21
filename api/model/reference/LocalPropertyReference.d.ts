import {LocalModelReference} from "./LocalModelReference";
import {ModelReferenceCallbacks} from "./LocalModelReference";
import {ReferenceDisposedCallback} from "./LocalModelReference";
import {PropertyReference} from "./PropertyReference";
export declare class LocalPropertyReference extends LocalModelReference<string, PropertyReference> {
  constructor(reference: PropertyReference, referenceCallbacks: ModelReferenceCallbacks, disposeCallback: ReferenceDisposedCallback);
}
