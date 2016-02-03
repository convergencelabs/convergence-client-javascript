import RealTimeData from "./RealTimeData";
import RealTimeContainer from "./RealTimeContainer";
import {PathElement} from "../ot/Path";
import DiscreteOperation from "../ot/ops/DiscreteOperation";
import ModelOperationEvent from "./ModelOperationEvent";
import DataType from "./DataType";

export default class RealTimeNull extends RealTimeData {

  /**
   * Constructs a new RealTimeNull.
   */
  constructor(parent: RealTimeContainer,
              fieldInParent: PathElement,
              sendOpCallback: (operation: DiscreteOperation) => void) {
    super(DataType.Null, parent, fieldInParent, sendOpCallback);
  }

  value(): any {
    return null;
  }

  _handleIncomingOperation(operationEvent: ModelOperationEvent): void {
    throw new Error("Method not implemented exception!");
  }
}
