import {Operation} from "./ops/Operation";
import {Immutable} from "../../util/Immutable";

/**
 * @hidden
 * @internal
 */
export class ServerOperationEvent {
  constructor(
    public clientId: string,
    public version: number,
    public timestamp: Date,
    public operation: Operation) {
    Object.freeze(this);
  }

  public copy(mods?: {
    clientId?: string,
    version?: number,
    timestamp?: Date,
    operation?: Operation
  }) {
    mods = Immutable.getOrDefault(mods, {});
    return new ServerOperationEvent(
      Immutable.getOrDefault(mods.clientId, this.clientId),
      Immutable.getOrDefault(mods.version, this.version),
      Immutable.getOrDefault(mods.timestamp, this.timestamp),
      Immutable.getOrDefault(mods.operation, this.operation)
    );
  }
}
