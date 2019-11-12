/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {
  DataValue,
  DateValue,
  NullValue,
  StringValue,
  ArrayValue,
  ObjectValue,
  NumberValue,
  BooleanValue
} from "./dataValue";

/**
 * @hidden
 * @internal
 */
export class DataValueFactory {
  constructor(private idGenerator: () => string) {
  }

  public createDataValue(data: any): DataValue {
    const id: string = this.idGenerator();
    const type: string = typeof data;
    if (data === null) {
      const nullValue: NullValue = {id, type: "null"};
      return nullValue;
    } else if (type === "string") {
      const stringValue: StringValue = {id, type, value: data};
      return stringValue;
    } else if (data instanceof Date) {
      const dateValue: DateValue = {id, type: "date", value: data};
      return dateValue;
    } else if (Array.isArray(data)) {
      const list: DataValue[] = data.map((child: any) => {
        return this.createDataValue(child);
      });
      const arrayValue: ArrayValue = {id, type: "array", children: list};
      return arrayValue;
    } else if (type === "object") {
      if (data.hasOwnProperty("$convergenceType")) {
        const convergenceType: string = data["$convergenceType"];
        if (convergenceType === "date") {
          if (data.hasOwnProperty("value")) {
            const dateValue: DateValue = {id, type: "date", value: new Date(data["delta"])};
            return dateValue;
          } else {
            throw new Error("Invalid convergence data type: " + type + " delta field missing.");
          }
        } else {
          throw new Error("Invalid convergence data type: " + type + " supported types are [date].");
        }
      } else {
        const props: { [key: string]: DataValue } = {};
        Object.getOwnPropertyNames(data).forEach((prop: string) => {
          props[prop] = this.createDataValue(data[prop]);
        });
        const objectValue: ObjectValue = {id, type, children: props};
        return objectValue;
      }
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
