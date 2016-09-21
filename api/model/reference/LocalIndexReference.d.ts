import {LocalModelReference} from "./LocalModelReference";
import {IndexReference} from "./IndexReference";
import {ModelReferenceCallbacks} from "./LocalModelReference";
import {ReferenceDisposedCallback} from "./LocalModelReference";
export declare class LocalIndexReference extends LocalModelReference<number, IndexReference> {
  constructor(reference: IndexReference, referenceCallbacks: ModelReferenceCallbacks, disposeCallback: ReferenceDisposedCallback);
}
