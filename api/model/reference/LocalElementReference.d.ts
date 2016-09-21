import {LocalModelReference} from "./LocalModelReference";
import {ModelReferenceCallbacks} from "./LocalModelReference";
import {ReferenceDisposedCallback} from "./LocalModelReference";
import {ElementReference} from "./ElementReference";
import {RealTimeValue} from "../rt/RealTimeValue";
export declare class LocalElementReference extends LocalModelReference<RealTimeValue<any>, ElementReference> {
  constructor(reference: ElementReference, referenceCallbacks: ModelReferenceCallbacks, disposeCallback: ReferenceDisposedCallback);
}
