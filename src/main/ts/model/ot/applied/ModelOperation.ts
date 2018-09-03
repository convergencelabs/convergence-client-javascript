import {AppliedOperation} from "./AppliedOperation";

/**
 * @hidden
 * @internal
 */
export class ModelOperation {

  constructor(public modelId: string, public version: number, public timestamp: number,
              public username: string, public sessionId: string, public operation: AppliedOperation) {
    Object.freeze(this);
  }
}
