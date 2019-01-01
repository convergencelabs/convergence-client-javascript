import {AppliedOperation} from "./AppliedOperation";

/**
 * @hidden
 * @internal
 */
export class ModelOperation {

  constructor(public readonly modelId: string,
              public readonly version: number,
              public readonly timestamp: Date,
              public readonly username: string,
              public readonly sessionId: string,
              public readonly operation: AppliedOperation) {
    Object.freeze(this);
  }
}
