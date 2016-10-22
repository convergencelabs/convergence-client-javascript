import {RealTimeValue} from "../rt/RealTimeValue";
import {ModelReference} from "./ModelReference";
import {ReferenceType} from "./ModelReference";
import {ReferenceManager} from "./ReferenceManager";

export class PropertyReference extends ModelReference<string> {

  constructor(referenceManager: ReferenceManager,
              key: string,
              source: RealTimeValue<any>,
              username: string,
              sessionId: string,
              local: boolean) {
    super(referenceManager, ReferenceType.PROPERTY, key, source, username, sessionId, local);
  }

  _handlePropertyRemoved(property: string): void {
    var index: number = this._values.indexOf(property, 0);
    if (index > -1) {
      let newElements: string[] = this._values.slice(0);
      newElements.splice(index, 1);
      this._set(newElements);
    }
  }
}
