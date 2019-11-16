/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "COPYING" and
 * "COPYING.LESSER" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
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
