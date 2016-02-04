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

  _setDetached(): void {
    this._detachChildren();
    super._setDetached();
  }

  protected abstract _detachChildren(): void;

}

export default RealTimeContainer;
