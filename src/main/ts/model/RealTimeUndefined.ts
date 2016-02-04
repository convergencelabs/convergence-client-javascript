import RealTimeValue from "./RealTimeValue";
import RealTimeContainer from "./RealTimeContainerValue";
import {PathElement} from "../ot/Path";
import DiscreteOperation from "../ot/ops/DiscreteOperation";
import ModelOperationEvent from "./ModelOperationEvent";
import DataType from "./DataType";

export default class RealTimeUndefined extends RealTimeValue {

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
