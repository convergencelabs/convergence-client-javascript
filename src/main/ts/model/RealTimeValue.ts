
import EventEmitter from "../util/EventEmitter";
import DataType from "./DataType";
import {PathElement, Path} from "./Path";
import DiscreteOperation from "../ot/ops/DiscreteOperation";
import ModelOperationEvent from "./ModelOperationEvent";

abstract class RealTimeValue extends EventEmitter {

  protected _detached: boolean = false;

  /**
   * Constructs a new RealTimeValue.
   */
  constructor(private modelType: DataType,
              private parent: RealTimeValue,
              public fieldInParent: PathElement,
              protected sendOpCallback: (operation: DiscreteOperation) => void) {
    super();
  }

  type(): DataType {
    return this.modelType;
  }

  abstract value(): any;

  path(): Path {
    if (this.parent == null) {
      return [];
    } else {
      var path: Path = this.parent.path();
      path.push(this.fieldInParent);
      return path;
    }
  }

  abstract _handleIncomingOperation(operationEvent: ModelOperationEvent): void;

}

export default RealTimeValue;
