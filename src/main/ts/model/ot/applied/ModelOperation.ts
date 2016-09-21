import {AppliedOperation} from "./AppliedOperation";
import {ModelFqn} from "../../ModelFqn";

export class ModelOperation {

  constructor(public modelFqn: ModelFqn, public version: number, public timestamp: number,
              public username: string, public sessionId: string, public operation: AppliedOperation) {
    Object.freeze(this);
  }
}
