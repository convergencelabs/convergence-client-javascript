import {Change} from "./operationChanges";

/**
 * @hidden
 * @internal
 */
export abstract class Operation implements Change {
  protected constructor(public readonly type: string) {
  }

  public abstract copy(modifications: any): Operation;
}
