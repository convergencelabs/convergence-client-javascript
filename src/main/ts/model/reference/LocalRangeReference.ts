import {LocalModelReference} from "./LocalModelReference";
import {ModelReferenceCallbacks} from "./LocalModelReference";
import {ReferenceDisposedCallback} from "./LocalModelReference";
import {RangeReference} from "./RangeReference";
import {IndexRange} from "./RangeReference";

export class LocalRangeReference extends LocalModelReference<IndexRange, RangeReference> {
  constructor(reference: RangeReference, referenceCallbacks: ModelReferenceCallbacks, disposeCallback: ReferenceDisposedCallback) {
    super(reference, referenceCallbacks, disposeCallback);
  }
}
