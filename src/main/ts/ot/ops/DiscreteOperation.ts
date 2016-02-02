import Operation from "./Operation";
import {Path} from "../Path";

export default abstract class DiscreteOperation extends Operation {
  constructor(type: string, public path: Path, public noOp: boolean) {
    super(type);
  }
}

