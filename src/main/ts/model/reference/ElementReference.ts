import {RealTimeValue} from "../rt/RealTimeValue";
import {ModelReference} from "./ModelReference";
import {ReferenceType} from "./ModelReference";
import {RealTimeModel} from "../rt/RealTimeModel";

export class ElementReference extends ModelReference<RealTimeValue<any>> {

  constructor(key: string,
              source: RealTimeModel,
              username: string,
              sessionId: string,
              local: boolean) {
    super(ReferenceType.ELEMENT, key, source, username, sessionId, local);
  }

  _handleElementRemoved(elemenet: RealTimeValue<any>): void {
    var index: number = this._values.indexOf(elemenet, 0);
    if (index > -1) {
      let newElements: RealTimeValue<any>[] = this._values.slice(0);
      newElements.splice(index, 1);
      this._set(newElements);
    }
  }
}
