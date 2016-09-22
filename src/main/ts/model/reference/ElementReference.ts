import {RealTimeValue} from "../rt/RealTimeValue";
import {ModelReference} from "./ModelReference";
import {ReferenceType} from "./ModelReference";
import {RealTimeModel} from "../rt/RealTimeModel";
import {ValueDetachedEvent} from "../rt/events";

export class ElementReference extends ModelReference<RealTimeValue<any>> {

  private _detachedListener: (event: ValueDetachedEvent) => void = (event: ValueDetachedEvent) => {
    this._handleElementRemoved(<RealTimeValue<any>>event.src);
  };

  constructor(key: string,
              source: RealTimeModel,
              username: string,
              sessionId: string,
              local: boolean) {
    super(ReferenceType.ELEMENT, key, source, username, sessionId, local);
  }

  _set(values: RealTimeValue<any>[], local: boolean = false): void {
    for (var oldElement of this.values()) {
      oldElement.removeListener(RealTimeValue.Events.DETACHED, this._detachedListener);
    }

    // Add Detached Listeners
    for (var newElement of values) {
      newElement.addListener(RealTimeValue.Events.DETACHED, this._detachedListener);
    }
    super._set(values, local);
  }

  _clear(): void {
    for (var oldElement of this.values()) {
      oldElement.removeListener(RealTimeValue.Events.DETACHED, this._detachedListener);
    }
    super._clear();
  }

  _handleElementRemoved(element: RealTimeValue<any>): void {
    var index: number = this._values.indexOf(element, 0);
    if (index > -1) {
      let newElements: RealTimeValue<any>[] = this._values.slice(0);
      newElements.splice(index, 1);
      this._set(newElements);
    }
  }
}
