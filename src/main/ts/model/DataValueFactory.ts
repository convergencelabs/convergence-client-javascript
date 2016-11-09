import {DataValue} from "./dataValue";
import {NullValue} from "./dataValue";
import {StringValue} from "./dataValue";
import {ArrayValue} from "./dataValue";
import {ObjectValue} from "./dataValue";
import {NumberValue} from "./dataValue";
import {BooleanValue} from "./dataValue";

export class DataValueFactory {
  constructor(private idGenerator: () => string) {}

  public createDataValue(data: any): DataValue {
    const id: string = this.idGenerator();
    const type: string = typeof data;
    if (data === null) {
      const nullValue: NullValue = {id, type: "null"};
      return nullValue;
    } else if (type === "string") {
      const stringValue: StringValue = {id, type, value: data};
      return stringValue;
    } else if (Array.isArray(data)) {
      const list: DataValue[] = data.map((child: any) => {
        return this.createDataValue(child);
      });
      const arrayValue: ArrayValue = {id, type: "array", children: list};
      return arrayValue;
    } else if (type === "object") {
      const props: {[key: string]: DataValue} = {};
      Object.getOwnPropertyNames(data).forEach((prop: string) => {
        props[prop] = this.createDataValue(data[prop]);
      });
      const objectValue: ObjectValue = {id, type, children: props};
      return objectValue;
    } else if (type === "number") {
      const numberValue: NumberValue = {id, type, value: data};
      return numberValue;
    } else if (type === "boolean") {
      const booleanValue: BooleanValue = {id, type, value: data};
      return booleanValue;
    } else {
      throw new Error("Invalid data type: " + type);
    }
  }
}
