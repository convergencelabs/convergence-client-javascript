import Operation from "./ops/Operation";

export default class ProcessedOperationEvent {
  constructor(
    public clientId: string,
    public contextVersion: number,
    public timestamp: number,
    public operation: Operation) {
    Object.freeze(this);
  }
}

