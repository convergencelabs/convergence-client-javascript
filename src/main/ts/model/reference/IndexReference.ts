import RealTimeValue from "../RealTimeValue";
import {ModelReference} from "./ModelReference";
import {ReferenceType} from "./ModelReference";

export class IndexReference extends ModelReference {

  constructor(key: string,
              source: RealTimeValue<any>,
              userId: string,
              sessionId: string,
              private _index: number) {
    super(ReferenceType.INDEX, key, source, userId, sessionId);
  }

  index(): number {
    return this._index;
  }

  isSet(): boolean {
    return this._index !== null;
  }

  _set(index: number, local: boolean = false): void {
    this._index = index;
    this.emit(ModelReference.Events.CHANGED, {
      local: local
    });
  }

  _clear(): void {
    this._index = null;
    this.emit(ModelReference.Events.CLEARED, {});
  }
}
