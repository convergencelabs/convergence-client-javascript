import {Operation} from "./Operation";
import {DiscreteChange} from "./operationChanges";

export abstract class DiscreteOperation extends Operation implements DiscreteChange {
  constructor(type: string, public id: string, public noOp: boolean) {
    super(type);
  }
}
