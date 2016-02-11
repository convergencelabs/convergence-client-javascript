import RealTimeValue from "./RealTimeValue";
import RealTimeContainerValue from "./RealTimeContainerValue";
import {PathElement} from "../ot/Path";
import DiscreteOperation from "../ot/ops/DiscreteOperation";
import ModelOperationEvent from "./ModelOperationEvent";
import RealTimeValueType from "./RealTimeValueType";
import {Path} from "../ot/Path";

export default class RealTimeNull extends RealTimeValue<any> {

  static Events: any = {
    DETACHED: RealTimeValue.Events.DETACHED
  };

  /**
   * Constructs a new RealTimeNull.
   */
  constructor(parent: RealTimeContainerValue<any>,
              fieldInParent: PathElement,
              sendOpCallback: (operation: DiscreteOperation) => void) {
    super(RealTimeValueType.Null, parent, fieldInParent, sendOpCallback);
  }

  protected _getValue(): any {
    return null;
  }

  protected _setValue(any: any): void {
    throw new Error("Can not set the value on a Null type.");
  }

  _handleRemoteOperation(relativePath: Path, operationEvent: ModelOperationEvent): void {
    if (relativePath.length === 0) {
      throw new Error("Null values do not process operations");
    } else {
      throw new Error("Invalid path: null values do not have children");
    }
  }
}
