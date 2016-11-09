import {Change} from "./operationChanges";

export abstract class Operation implements Change {
  constructor(public type: string) {
  }

  public abstract copy(properties: any): Operation;
}
