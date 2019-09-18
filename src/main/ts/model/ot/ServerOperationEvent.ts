import {Operation} from "./ops/Operation";

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
}
