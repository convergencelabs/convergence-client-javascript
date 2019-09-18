import {Operation} from "./ops/Operation";

/**
 * @hidden
 * @internal
 */
export class ClientOperationEvent {
  constructor(
    public clientId: string,
    public seqNo: number,
    public contextVersion: number,
    public timestamp: Date,
    public operation: Operation) {
    Object.freeze(this);
  }
}
