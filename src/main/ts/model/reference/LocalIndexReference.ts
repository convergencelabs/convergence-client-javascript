import {LocalModelReference} from "./LocalModelReference";
import {IndexReference} from "./IndexReference";
import {ModelReferenceCallbacks} from "./LocalModelReference";

export class LocalIndexReference extends LocalModelReference<IndexReference> {

  constructor(reference: IndexReference, callbacks: ModelReferenceCallbacks) {
    super(reference, callbacks);
  }

  set(index: number): void {
    this._reference._set(index, true);
    this._fireSet();
  }
}
