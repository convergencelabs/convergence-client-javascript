import Operation from "./ops/Operation";

export default class ProcessedOperationEvent {
  constructor(
    public clientId: string,
    public seqNo: number,
    public version: number,
    public timestamp: number,
    public operation: Operation) {
    Object.freeze(this);
  }
}

