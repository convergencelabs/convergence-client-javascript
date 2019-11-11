import {Change} from "../ops/operationChanges";

/**
 * @hidden
 * @internal
 */
export abstract class AppliedOperation implements Change {
  protected constructor(public readonly type: string) {
  }

  public abstract inverse(): AppliedOperation;
}
