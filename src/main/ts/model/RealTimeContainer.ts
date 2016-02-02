import RealTimeData from "./RealTimeData";
import {DataType} from "./RealTimeData";
import {PathElement} from "../ot/Path";
import DiscreteOperation from "../ot/ops/DiscreteOperation";

export default abstract class RealTimeContainer extends RealTimeData {

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
