import Operation from "./Operation";

abstract class DiscreteOperation extends Operation {
  constructor(type: string, public id: string, public noOp: boolean) {
    super(type);
  }
}
export default DiscreteOperation;
