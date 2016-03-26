import {RealTimeValue} from "./RealTimeValue";
import RealTimeNull from "./RealTimeNull";
import RealTimeUndefined from "./RealTimeUndefined";
import RealTimeString from "./RealTimeString";
import RealTimeArray from "./RealTimeArray";
import RealTimeObject from "./RealTimeObject";
import RealTimeNumber from "./RealTimeNumber";
import {RealTimeContainerValue} from "./RealTimeContainerValue";
import {PathElement} from "./ot/Path";
import RealTimeBoolean from "./RealTimeBoolean";
import {RealTimeModel} from "./RealTimeModel";
import {ModelEventCallbacks} from "./RealTimeModel";
import {DataValue} from "../connection/protocol/model/dataValue";
import {StringValue} from "../connection/protocol/model/dataValue";
import {ArrayValue} from "../connection/protocol/model/dataValue";
import {ObjectValue} from "../connection/protocol/model/dataValue";
import {NumberValue} from "../connection/protocol/model/dataValue";
import {BooleanValue} from "../connection/protocol/model/dataValue";

export default class RealTimeValueFactory {

  public static create(data: DataValue,
                       parent: RealTimeContainerValue<any>,
                       fieldInParent: PathElement,
                       callbacks: ModelEventCallbacks,
                       model: RealTimeModel): RealTimeValue<any> {

    if (data === undefined) {
      return new RealTimeUndefined(undefined, parent, fieldInParent, callbacks, model);
    }

    var type: string = data.type;
    if (type === "null") {
      return new RealTimeNull(data.id, parent, fieldInParent, callbacks, model);
    } else if (type === "string") {
      return new RealTimeString(<StringValue>data, parent, fieldInParent, callbacks, model);
    } else if (Array.isArray(data)) {
      return new RealTimeArray(<ArrayValue>data, parent, fieldInParent, callbacks, model);
    } else if (type === "object") {
      return new RealTimeObject(<ObjectValue>data, parent, fieldInParent, callbacks, model);
    } else if (type === "number") {
      return new RealTimeNumber(<NumberValue>data, parent, fieldInParent, callbacks, model);
    } else if (type === "boolean") {
      return new RealTimeBoolean(<BooleanValue>data, parent, fieldInParent, callbacks, model);
    } else {
      throw new Error("Invalid data type: " + type);
    }
  }
}
