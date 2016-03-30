import {RealTimeValue} from "../RealTimeValue";
import {ModelReference} from "./ModelReference";
import {ReferenceType} from "./ModelReference";

export class PropertyReference extends ModelReference<string> {

  constructor(key: string,
              source: RealTimeValue<any>,
              userId: string,
              sessionId: string,
              local: boolean) {
    super(ReferenceType.PROPERTY, key, source, userId, sessionId, local);
  }

  _handlePropertyRemoved(property: string): void {
    if (this.value() === property) {
      this._set(null);
    }
  }
}
