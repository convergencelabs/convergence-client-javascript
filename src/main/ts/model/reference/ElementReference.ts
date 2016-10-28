import {RealTimeElement} from "../rt/RealTimeElement";
import {ModelReference} from "./ModelReference";
import {ReferenceType} from "./ModelReference";
import {RealTimeModel} from "../rt/RealTimeModel";
import {ValueDetachedEvent} from "../rt/events";
import {ReferenceManager} from "./ReferenceManager";

export class ElementReference extends ModelReference<RealTimeElement<any>> {

  private _detachedListener: (event: ValueDetachedEvent) => void = (event: ValueDetachedEvent) => {
    this._handleElementRemoved(<RealTimeElement<any>>event.src);
  };

  constructor(referenceManager: ReferenceManager,
              key: string,
              source: RealTimeModel,
              username: string,
              sessionId: string,
              local: boolean) {
    super(referenceManager, ReferenceType.ELEMENT, key, source, username, sessionId, local);
  }

  _set(values: RealTimeElement<any>[], local: boolean = false): void {
    for (var oldElement of this.values()) {
      oldElement.removeListener(RealTimeElement.Events.DETACHED, this._detachedListener);
    }

    // Add Detached Listeners
    for (var newElement of values) {
      newElement.addListener(RealTimeElement.Events.DETACHED, this._detachedListener);
    }
    super._set(values, local);
  }

  _clear(): void {
    for (var oldElement of this.values()) {
      oldElement.removeListener(RealTimeElement.Events.DETACHED, this._detachedListener);
    }
    super._clear();
  }

  _handleElementRemoved(element: RealTimeElement<any>): void {
    var index: number = this._values.indexOf(element, 0);
    if (index > -1) {
      let newElements: RealTimeElement<any>[] = this._values.slice(0);
      newElements.splice(index, 1);
      this._set(newElements);
    }
  }
}
