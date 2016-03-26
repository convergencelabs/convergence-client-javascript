import {DataValue} from "../connection/protocol/model/dataValue";
import {NullValue} from "../connection/protocol/model/dataValue";
import {ObjectValue} from "../connection/protocol/model/dataValue";
import {NumberValue} from "../connection/protocol/model/dataValue";
import {StringValue} from "../connection/protocol/model/dataValue";
import {ArrayValue} from "../connection/protocol/model/dataValue";

export class DataValueFactory {
  static createDataValue(data: any, idGenerator: () => string): DataValue {
    var id: string = idGenerator();
    var type: string = typeof data;
    if (data === null) {
      var nullValue: NullValue = {id: id, type: "null"};
      return nullValue;
    } else if (type === "string") {
      var stringValue: StringValue = {id: id, type: type, value: data};
      return stringValue;
    } else if (Array.isArray(data)) {
      var list: DataValue[] = data.map((child: any) => {
        return DataValueFactory.createDataValue(child, idGenerator);
      });
      var arrayValue: ArrayValue = {id: id, type: "array", children: list};
      return arrayValue;
    } else if (type === "object") {
      var props: {[key: string]: DataValue} = {};
      Object.getOwnPropertyNames(data).forEach((prop: string) => {
        props[prop] = DataValueFactory.createDataValue(data[prop], idGenerator);
      });
      var objectValue: ObjectValue = {id: id, type: type, children: props};
      return objectValue;
    } else if (type === "number") {
      var numberValue: NumberValue = {id: id, type: type, value: data};
      return numberValue;
    } else if (type === "boolean") {
      var booleanValue: StringValue = {id: id, type: type, value: data};
      return booleanValue;
    } else {
      throw new Error("Invalid data type: " + type);
    }
  }
}
