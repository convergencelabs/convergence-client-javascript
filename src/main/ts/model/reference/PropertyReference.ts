import {RealTimeValue} from "../rt/RealTimeValue";
import {ModelReference} from "./ModelReference";
import {ReferenceType} from "./ModelReference";

export class PropertyReference extends ModelReference<string> {

  constructor(key: string,
              source: RealTimeValue<any>,
              username: string,
              sessionId: string,
              local: boolean) {
    super(ReferenceType.PROPERTY, key, source, username, sessionId, local);
  }

  _handlePropertyRemoved(property: string): void {
    if (this.value() === property) {
      this._set(null);
    }
  }
}
