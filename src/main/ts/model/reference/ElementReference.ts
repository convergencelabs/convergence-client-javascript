import {RealTimeElement} from "../rt/RealTimeElement";
import {ModelReference} from "./ModelReference";
import {ReferenceType} from "./ModelReference";
import {RealTimeModel} from "../rt/RealTimeModel";
import {ElementDetachedEvent} from "../rt/events";
import {ReferenceManager} from "./ReferenceManager";

export class ElementReference extends ModelReference<RealTimeElement<any>> {

  constructor(referenceManager: ReferenceManager,
              key: string,
              source: RealTimeModel,
              username: string,
              sessionId: string,
              local: boolean) {
    super(referenceManager, ReferenceType.ELEMENT, key, source, username, sessionId, local);
  }

  public _set(values: RealTimeElement<any>[], local: boolean = false): void {
    for (let oldElement of this.values()) {
      oldElement.removeListener(RealTimeElement.Events.DETACHED, this._detachedListener);
    }

    // Add Detached Listeners
    for (let newElement of values) {
      newElement.addListener(RealTimeElement.Events.DETACHED, this._detachedListener);
    }
    super._set(values, local);
  }

  public _clear(): void {
    for (let oldElement of this.values()) {
      oldElement.removeListener(RealTimeElement.Events.DETACHED, this._detachedListener);
    }
    super._clear();
  }

  public _handleElementRemoved(element: RealTimeElement<any>): void {
    const index: number = this._values.indexOf(element, 0);
    if (index > -1) {
      let newElements: RealTimeElement<any>[] = this._values.slice(0);
      newElements.splice(index, 1);
      this._set(newElements);
    }
  }

  private _detachedListener: (event: ElementDetachedEvent) => void = (event: ElementDetachedEvent) => {
    this._handleElementRemoved(<RealTimeElement<any>> event.src);
  };
}
