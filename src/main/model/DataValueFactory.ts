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
  IDataValue,
  IDateValue,
  INullValue,
  IStringValue,
  IArrayValue,
  IObjectValue,
  INumberValue,
  IBooleanValue
} from "./dataValue";

/**
 * @hidden
 * @internal
 */
export class DataValueFactory {
  constructor(private idGenerator: () => string) {
  }

  public createDataValue(data: any): IDataValue {
    const id: string = this.idGenerator();
    const type: string = typeof data;
    if (data === null) {
      const nullValue: INullValue = {id, type: "null", value: null};
      return nullValue;
    } else if (type === "string") {
      const stringValue: IStringValue = {id, type, value: data};
      return stringValue;
    } else if (data instanceof Date) {
      const dateValue: IDateValue = {id, type: "date", value: data};
      return dateValue;
    } else if (Array.isArray(data)) {
      const list: IDataValue[] = data.map((child: any) => {
        return this.createDataValue(child);
      });
      const arrayValue: IArrayValue = {id, type: "array", value: list};
      return arrayValue;
    } else if (type === "object") {
      if (data.hasOwnProperty("$convergenceType")) {
        const convergenceType: string = data["$convergenceType"];
        if (convergenceType === "date") {
          if (data.hasOwnProperty("value")) {
            const dateValue: IDateValue = {id, type: "date", value: new Date(data["delta"])};
            return dateValue;
          } else {
            throw new Error("Invalid convergence data type: " + type + " delta field missing.");
          }
        } else {
          throw new Error("Invalid convergence data type: " + type + " supported types are [date].");
        }
      } else {
        const props: { [key: string]: IDataValue } = {};
        Object.getOwnPropertyNames(data).forEach((prop: string) => {
          props[prop] = this.createDataValue(data[prop]);
        });
        const objectValue: IObjectValue = {id, type, value: props};
        return objectValue;
      }
    } else if (type === "number") {
      const numberValue: INumberValue = {id, type, value: data};
      return numberValue;
    } else if (type === "boolean") {
      const booleanValue: IBooleanValue = {id, type, value: data};
      return booleanValue;
    } else {
      throw new Error("Invalid data type: " + type);
    }
  }
}
