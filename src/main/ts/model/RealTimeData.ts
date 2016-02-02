
import EventEmitter from "../util/EventEmitter";
import RealTimeContainer from "./RealTimeContainer";
import {PathElement} from "../ot/Path";
import DiscreteOperation from "../ot/ops/DiscreteOperation";
import RealTimeNull from "./RealTimeNull";
import RealTimeUndefined from "./RealTimeUndefined";
import RealTimeString from "./RealTimeString";
import RealTimeArray from "./RealTimeArray";
import RealTimeObject from "./RealTimeObject";
import RealTimeNumber from "./RealTimeNumber";
import RealTimeBoolean from "./RealTimeBoolean";
import {Path} from "../ot/Path";
import ModelOperationEvent from "./ModelOperationEvent";

export enum DataType {Object, Array, String, Number, Boolean, Null, Undefined}

export default abstract class RealTimeData extends EventEmitter {

  protected _detached: boolean = false;

  public static create(data: any,
                       parent: RealTimeContainer,
                       fieldInParent: PathElement,
                       sendOpCallback: (operation: DiscreteOperation) => void): RealTimeData {
    var type: string = typeof data;
    if (data === null) {
      return new RealTimeNull(parent, fieldInParent, sendOpCallback);
    } else if (type === undefined) {
      return new RealTimeUndefined(parent, fieldInParent, sendOpCallback);
    } else if (type === "string") {
      return new RealTimeString(data, parent, fieldInParent, sendOpCallback);
    } else if (Array.isArray(data)) {
      return new RealTimeArray(data, parent, fieldInParent, sendOpCallback);
    } else if (type === "object") {
      return new RealTimeObject(data, parent, fieldInParent, sendOpCallback);
    } else if (type === "number") {
      return new RealTimeNumber(data, parent, fieldInParent, sendOpCallback);
    } else if (type === "boolean") {
      return new RealTimeBoolean(data, parent, fieldInParent, sendOpCallback);
    }
  }

  /**
   * Constructs a new RealTimeData.
   */
  constructor(private modelType: DataType,
              private parent: RealTimeData,
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

  protected abstract _handleIncomingOperation(operationEvent: ModelOperationEvent): void;

}
