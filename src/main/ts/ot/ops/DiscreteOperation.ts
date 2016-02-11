import Operation from "./Operation";
import {Path} from "../Path";
import OperationType from "../../protocol/model/OperationType";

abstract class DiscreteOperation extends Operation {
  constructor(type: OperationType, public path: Path, public noOp: boolean) {
    super(type);
  }
}
export default DiscreteOperation;

