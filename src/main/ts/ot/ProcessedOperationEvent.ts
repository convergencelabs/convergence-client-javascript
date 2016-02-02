import Operation from "./ops/Operation";

export class ProcessedOperationEvent {
  private _clientId: string;
  private _contextVersion: number;
  private _timestamp: number;
  private _operation: Operation;

  constructor(clientId: string,
              contextVersion: number,
              timestamp: number,
              operation: Operation) {
    this._clientId = clientId;
    this._contextVersion = contextVersion;
    this._timestamp = timestamp;
    this._operation = operation;
  }

  get clientId(): string {
    return this._clientId;
  }

  get contextVersion(): number {
    return this._contextVersion;
  }

  get timestamp(): number {
    return this._timestamp;
  }

  get operation(): Operation {
    return this._operation;
  }
}

