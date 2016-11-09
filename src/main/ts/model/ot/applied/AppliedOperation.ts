import {Change} from "../ops/operationChanges";

export abstract class AppliedOperation implements Change {
  constructor(public type: string) {
  }

  public abstract inverse(): AppliedOperation;
}
