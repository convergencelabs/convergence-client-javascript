import {Operation} from "./Operation";

export abstract class DiscreteOperation extends Operation {
  constructor(type: string, public id: string, public noOp: boolean) {
    super(type);
  }
}
