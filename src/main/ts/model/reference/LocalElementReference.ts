import {LocalModelReference} from "./LocalModelReference";
import {ModelReferenceCallbacks} from "./LocalModelReference";
import {ReferenceDisposedCallback} from "./LocalModelReference";
import {ElementReference} from "./ElementReference";
import {RealTimeValue} from "../rt/RealTimeValue";

export class LocalElementReference extends LocalModelReference<RealTimeValue<any>, ElementReference> {

  private _detachedListener: Function = (rtValue) => {
    this._reference._handleElementRemoved(rtValue);
  };

  constructor(reference: ElementReference, referenceCallbacks: ModelReferenceCallbacks, disposeCallback: ReferenceDisposedCallback) {
    super(reference, referenceCallbacks, disposeCallback);
  }

  set(value: RealTimeValue<any> | RealTimeValue<any>[]): void {
    // Remove Old Detached Listeners
    if (this.values() !== null) {
      for (var oldElement of this.values()) {
        oldElement.removeListener(RealTimeValue.Events.DETACHED, this._detachedListener);
      }
    }

    // Add Detached Listeners
    if (value instanceof Array) {
      for (var newElement of value) {
        newElement.addListener(RealTimeValue.Events.DETACHED, this._detachedListener);
      }
    } else {
      (<RealTimeValue<any>> value).addListener(RealTimeValue.Events.DETACHED, this._detachedListener);
    }

    super.set(<RealTimeValue<any>[]> value);
  }
}
