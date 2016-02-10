import RealTimeValue from "./RealTimeValue";
import RealTimeContainerValue from "./RealTimeContainerValue";
import {PathElement} from "../ot/Path";
import DiscreteOperation from "../ot/ops/DiscreteOperation";
import ModelOperationEvent from "./ModelOperationEvent";
import RealTimeValueType from "./RealTimeValueType";
import {Path} from "../ot/Path";

export default class RealTimeUndefined extends RealTimeValue<void> {

  /**
   * Constructs a new RealTimeUndefined.
   */
  constructor(parent: RealTimeContainerValue<any>,
              fieldInParent: PathElement,
              sendOpCallback: (operation: DiscreteOperation) => void) {
    super(RealTimeValueType.Undefined, parent, fieldInParent, sendOpCallback);
  }

  value(): void {
    return undefined;
  }

  _handleRemoteOperation(relativePath: Path, operationEvent: ModelOperationEvent): void {
    if (relativePath.length === 0) {
      throw new Error("Null values do not process operations");
    } else {
      throw new Error("Invalid path: null values do not have children");
    }
  }
}
