import {LocalModelReference} from "./LocalModelReference";
import {IndexReference} from "./IndexReference";
import {ModelReferenceCallbacks} from "./LocalModelReference";

export class LocalIndexReference extends LocalModelReference<number, IndexReference> {
  constructor(reference: IndexReference, referenceCallbacks: ModelReferenceCallbacks) {
    super(reference, referenceCallbacks);
  }
}
