import {RealTimeElement} from "../rt/RealTimeElement";
import {ModelReference} from "./ModelReference";
import {ReferenceType} from "./ModelReference";
import {ReferenceManager} from "./ReferenceManager";

export class PropertyReference extends ModelReference<string> {

  constructor(referenceManager: ReferenceManager,
              key: string,
              source: RealTimeElement<any>,
              username: string,
              sessionId: string,
              local: boolean) {
    super(referenceManager, ReferenceType.PROPERTY, key, source, username, sessionId, local);
  }

  public _handlePropertyRemoved(property: string): void {
    const index: number = this._values.indexOf(property, 0);
    if (index > -1) {
      let newElements: string[] = this._values.slice(0);
      newElements.splice(index, 1);
      this._set(newElements);
    }
  }
}
