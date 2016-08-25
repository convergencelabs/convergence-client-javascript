import {RealTimeValue} from "../rt/RealTimeValue";
import {ModelReference} from "./ModelReference";
import {ReferenceType} from "./ModelReference";
import {RealTimeModel} from "../rt/RealTimeModel";

export class ElementReference extends ModelReference<Array<RealTimeValue<any>>> {

  constructor(key: string,
              source: RealTimeModel,
              username: string,
              sessionId: string,
              local: boolean) {
    super(ReferenceType.ELEMENT, key, source, username, sessionId, local);
  }

  _handleElementRemoved(elemenet: RealTimeValue<any>): void {
    var index: number = this.value().indexOf(elemenet, 0);
    if (index > -1) {
      let newElements: Array<RealTimeValue<any>> = this.value().slice(0);
      newElements.splice(index, 1);
      this._set(newElements);
    }
  }
}
