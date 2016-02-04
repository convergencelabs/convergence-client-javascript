import RealTimeValue from "./RealTimeValue";
import {PathElement} from "../ot/Path";
import DiscreteOperation from "../ot/ops/DiscreteOperation";
import DataType from "./DataType";

abstract class RealTimeContainer extends RealTimeValue {

  /**
   * Constructs a new RealTimeContainer.
   */
  constructor(modelType: DataType,
              parent: RealTimeContainer,
              fieldInParent: PathElement,
              sendOpCallback: (operation: DiscreteOperation) => void) {
    super(modelType, parent, fieldInParent, sendOpCallback);
  }
}

export default RealTimeContainer;
