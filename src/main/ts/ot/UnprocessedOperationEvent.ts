import Operation from "./ops/Operation";

export default class UnprocessedOperationEvent {
  constructor(
    public clientId: string,
    public seqNo: number,
    public contextVersion: number,
    public timestamp: number,
    public operation: Operation) {
    Object.freeze(this);
  }
}
