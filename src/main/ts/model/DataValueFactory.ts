import {DataValue} from "./dataValue";
import {NullValue} from "./dataValue";
import {StringValue} from "./dataValue";
import {ArrayValue} from "./dataValue";
import {ObjectValue} from "./dataValue";
import {NumberValue} from "./dataValue";
import {BooleanValue} from "./dataValue";

export class DataValueFactory {
  constructor(private idGenerator: () => string) {}

  createDataValue(data: any): DataValue {
    var id: string = this.idGenerator();
    var type: string = typeof data;
    if (data === null) {
      var nullValue: NullValue = {id: id, type: "null"};
      return nullValue;
    } else if (type === "string") {
      var stringValue: StringValue = {id: id, type: type, value: data};
      return stringValue;
    } else if (Array.isArray(data)) {
      var list: DataValue[] = data.map((child: any) => {
        return this.createDataValue(child);
      });
      var arrayValue: ArrayValue = {id: id, type: "array", children: list};
      return arrayValue;
    } else if (type === "object") {
      var props: {[key: string]: DataValue} = {};
      Object.getOwnPropertyNames(data).forEach((prop: string) => {
        props[prop] = this.createDataValue(data[prop]);
      });
      var objectValue: ObjectValue = {id: id, type: type, children: props};
      return objectValue;
    } else if (type === "number") {
      var numberValue: NumberValue = {id: id, type: type, value: data};
      return numberValue;
    } else if (type === "boolean") {
      var booleanValue: BooleanValue = {id: id, type: type, value: data};
      return booleanValue;
    } else {
      throw new Error("Invalid data type: " + type);
    }
  }
}
