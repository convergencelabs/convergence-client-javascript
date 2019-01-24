import {RealTimeModel, RealTimeElement} from "../rt/";
import {ModelReference} from "./ModelReference";
import {ElementDetachedEvent} from "../events/ElementDetachedEvent";
import {ReferenceManager} from "./ReferenceManager";
import {DomainUser} from "../../identity";

export class ElementReference extends ModelReference<RealTimeElement<any>> {

  /**
   * @param referenceManager
   * @param key
   * @param source
   * @param user
   * @param sessionId
   * @param local
   *
   * @hidden
   * @internal
   */
  constructor(referenceManager: ReferenceManager,
              key: string,
              source: RealTimeModel,
              user: DomainUser,
              sessionId: string,
              local: boolean) {
    super(referenceManager, ModelReference.Types.ELEMENT, key, source, user, sessionId, local);
  }

  /**
   * @param values
   * @private
   * @hidden
   * @internal
   */
  public _set(values: Array<RealTimeElement<any>>, synthetic: boolean): void {
    for (const oldElement of this.values()) {
      oldElement.removeListener(RealTimeElement.Events.DETACHED, this._detachedListener);
    }

    // Add Detached Listeners
    for (const newElement of values) {
      newElement.addListener(RealTimeElement.Events.DETACHED, this._detachedListener);
    }
    super._set(values, synthetic);
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
      this._set(newElements, true);
    }
  }

  /**
   * @param event
   * @internal
   */
  private _detachedListener: (event: ElementDetachedEvent) => void = (event: ElementDetachedEvent) => {
    this._handleElementRemoved(event.src as RealTimeElement<any>);
  }
}
