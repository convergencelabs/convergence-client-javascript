import {RealTimeModel, RealTimeElement} from "../rt/";
import {ModelReference} from "./ModelReference";
import {ElementDetachedEvent} from "../modelEvents";
import {ReferenceManager} from "./ReferenceManager";

export class ElementReference extends ModelReference<RealTimeElement<any>> {

  /**
   * @param referenceManager
   * @param key
   * @param source
   * @param username
   * @param sessionId
   * @param local
   *
   * @hidden
   * @internal
   */
  constructor(referenceManager: ReferenceManager,
              key: string,
              source: RealTimeModel,
              username: string,
              sessionId: string,
              local: boolean) {
    super(referenceManager, ModelReference.Types.ELEMENT, key, source, username, sessionId, local);
  }

  /**
   * @param values
   * @private
   * @hidden
   * @internal
   */
  public _set(values: Array<RealTimeElement<any>>): void {
    for (const oldElement of this.values()) {
      oldElement.removeListener(RealTimeElement.Events.DETACHED, this._detachedListener);
    }

    // Add Detached Listeners
    for (const newElement of values) {
      newElement.addListener(RealTimeElement.Events.DETACHED, this._detachedListener);
    }
    super._set(values);
  }

  /**
   * @hidden
   * @internal
   * @private
   */
  public _clear(): void {
    for (const oldElement of this.values()) {
      oldElement.removeListener(RealTimeElement.Events.DETACHED, this._detachedListener);
    }
    super._clear();
  }

  /**
   * @param element
   * @private
   * @hidden
   * @internal
   */
  public _handleElementRemoved(element: RealTimeElement<any>): void {
    const index: number = this._values.indexOf(element, 0);
    if (index > -1) {
      const newElements: Array<RealTimeElement<any>> = this._values.slice(0);
      newElements.splice(index, 1);
      this._set(newElements);
    }
  }

  /**
   * @param event
   * @internal
   */
  private _detachedListener: (event: ElementDetachedEvent) => void = (event: ElementDetachedEvent) => {
    this._handleElementRemoved(<RealTimeElement<any>> event.src);
  }
}
