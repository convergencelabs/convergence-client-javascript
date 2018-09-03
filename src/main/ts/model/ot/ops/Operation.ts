import {Change} from "./operationChanges";

/**
 * @hidden
 * @internal
 */
export abstract class Operation implements Change {
  protected constructor(public type: string) {
  }

  public abstract copy(properties: any): Operation;
}
