import RealTimeData from "./RealTimeData";
import RealTimeContainer from "./RealTimeContainer";
import {PathElement} from "../ot/Path";
import DiscreteOperation from "../ot/ops/DiscreteOperation";
import {DataType} from "./RealTimeData";
import ModelOperationEvent from "./ModelOperationEvent";

export default class RealTimeUndefined extends RealTimeData {

  /**
   * Constructs a new RealTimeUndefined.
   */
  constructor(parent: RealTimeContainer,
              fieldInParent: PathElement,
              sendOpCallback: (operation: DiscreteOperation) => void) {
    super(DataType.Undefined, parent, fieldInParent, sendOpCallback);
  }

  value(): any {
    return undefined;
  }

  _handleIncomingOperation(operationEvent: ModelOperationEvent): void {
    throw new Error("Method not implemented exception!");
  }
}
