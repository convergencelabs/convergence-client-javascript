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
import RealTimeModel from "./RealTimeModel";

export default class RealTimeValueFactory {

  public static create(data: any,
                       parent: RealTimeContainerValue<any>,
                       fieldInParent: PathElement,
                       sendOpCallback: (operation: DiscreteOperation) => void,
                       model: RealTimeModel): RealTimeValue<any> {
    var type: string = typeof data;
    if (data === null) {
      return new RealTimeNull(parent, fieldInParent, sendOpCallback, model);
    } else if (type === undefined) {
      return new RealTimeUndefined(parent, fieldInParent, sendOpCallback, model);
    } else if (type === "string") {
      return new RealTimeString(data, parent, fieldInParent, sendOpCallback, model);
    } else if (Array.isArray(data)) {
      return new RealTimeArray(data, parent, fieldInParent, sendOpCallback, model);
    } else if (type === "object") {
      return new RealTimeObject(data, parent, fieldInParent, sendOpCallback, model);
    } else if (type === "number") {
      return new RealTimeNumber(data, parent, fieldInParent, sendOpCallback, model);
    } else if (type === "boolean") {
      return new RealTimeBoolean(data, parent, fieldInParent, sendOpCallback, model);
    }
  }
}
