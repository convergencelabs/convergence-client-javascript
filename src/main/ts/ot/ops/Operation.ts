import OperationType from "../../protocol/model/OperationType";
abstract class Operation {
  constructor(public type: OperationType) {
  }

  abstract copy(properties: any): Operation;
}

export default Operation;
