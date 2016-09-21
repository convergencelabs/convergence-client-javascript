import {LocalModelReference} from "./LocalModelReference";
import {ModelReferenceCallbacks} from "./LocalModelReference";
import {ReferenceDisposedCallback} from "./LocalModelReference";
import {RangeReference} from "./RangeReference";
import {IndexRange} from "./RangeReference";
export declare class LocalRangeReference extends LocalModelReference<IndexRange, RangeReference> {
  constructor(reference: RangeReference, referenceCallbacks: ModelReferenceCallbacks, disposeCallback: ReferenceDisposedCallback);
}
