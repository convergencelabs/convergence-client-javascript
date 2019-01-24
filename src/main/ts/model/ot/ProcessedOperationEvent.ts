import {Operation} from "./ops/Operation";

/**
 * @hidden
 * @internal
 */
export class ProcessedOperationEvent {
  constructor(
    public clientId: string,
    public seqNo: number,
    public version: number,
    public timestamp: Date,
    public operation: Operation) {
    Object.freeze(this);
  }
}
