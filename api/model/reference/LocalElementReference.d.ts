import {LocalModelReference} from "./LocalModelReference";
import {ModelReferenceCallbacks} from "./LocalModelReference";
import {ReferenceDisposedCallback} from "./LocalModelReference";
import {ElementReference} from "./ElementReference";
import {RealTimeElement} from "../rt/RealTimeElement";
export declare class LocalElementReference extends LocalModelReference<RealTimeElement<any>, ElementReference> {
  constructor(reference: ElementReference, referenceCallbacks: ModelReferenceCallbacks, disposeCallback: ReferenceDisposedCallback);
}
