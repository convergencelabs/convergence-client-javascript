import RealTimeValue from "./RealTimeValue";
import RealTimeNull from "./RealTimeNull";
import RealTimeUndefined from "./RealTimeUndefined";
import RealTimeString from "./RealTimeString";
import RealTimeArray from "./RealTimeArray";
import RealTimeObject from "./RealTimeObject";
import RealTimeNumber from "./RealTimeNumber";
import RealTimeContainerValue from "./RealTimeContainerValue";
import {PathElement} from "./ot/Path";
import DiscreteOperation from "./ot/ops/DiscreteOperation";
import RealTimeBoolean from "./RealTimeBoolean";

export default class RealTimeValueFactory {

  public static create(data: any,
                       parent: RealTimeContainerValue<any>,
                       fieldInParent: PathElement,
                       sendOpCallback: (operation: DiscreteOperation) => void): RealTimeValue<any> {
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
}
