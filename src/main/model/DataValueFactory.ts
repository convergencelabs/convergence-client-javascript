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
  IArrayValue,
  IBooleanValue,
  IDataValue,
  IDateValue,
  INullValue,
  INumberValue,
  IObjectValue,
  IStringValue
} from "./dataValue";
import {TypeChecker} from "../util/TypeChecker";
import {ConvergenceError} from "../util";

/**
 * @hidden
 * @internal
 */
export class DataValueFactory {
  constructor(private _idGenerator: () => string,
              private _undefinedObjectValues: "error" | "omit",
              private _undefinedArrayValues: "error" | "null"
              ) {
  }

  public createDataValue(data: any,
                         ): IDataValue {
    const id: string = this._idGenerator();
    if (TypeChecker.isNull(data)) {
      return {id, type: "null", value: null} as INullValue;
    } else if (TypeChecker.isString(data)) {
      return {id, type: "string", value: data} as IStringValue;
    } else if (TypeChecker.isDate(data)) {
      return {id, type: "date", value: data} as IDateValue;
    } else if (TypeChecker.isArray(data)) {
      const list: IDataValue[] = data.map((child: any) => {
        if (child === undefined) {
          if (this._undefinedArrayValues === "null") {
            return this.createDataValue(null);
          } else {
            throw new ConvergenceError("Found an undefined value within an array. " +
                "To convert undefined values in arrays to null, set the " +
                "options.model.data.undefinedArrayValues option to 'null'");
          }
        } else {
          return this.createDataValue(child);
        }
      });
      return {id, type: "array", value: list} as IArrayValue;
    } else if (TypeChecker.isObject(data)) {
      if (data.hasOwnProperty("$convergenceType")) {
        const convergenceType: string = data["$convergenceType"];
        if (convergenceType === "date") {
          if (data.hasOwnProperty("value")) {
            return {id, type: "date", value: new Date(data["value"])} as IDateValue;
          } else {
            throw new ConvergenceError("Invalid convergence data type 'data': The value field missing.");
          }
        } else {
          throw new ConvergenceError("Invalid convergence data type: " + convergenceType + " supported types are [date].");
        }
      } else {
        const props: { [key: string]: IDataValue } = {};
        Object.getOwnPropertyNames(data).forEach((prop: string) => {
          const child = data[prop];
          if (child === undefined) {
            if (this._undefinedObjectValues !== "omit") {
              throw new ConvergenceError("Found an undefined value within an object. " +
                  "To simply omit undefined values within objects, set the " +
                  "options.model.data.undefinedArrayValues " +
                  "option to 'omit'");
            }
          } else {
            props[prop] = this.createDataValue(child);
          }
        });
        return {id, type: "object", value: props} as IObjectValue;
      }
    } else if (TypeChecker.isNumber(data)) {
      return {id, type: "number", value: data} as INumberValue;
    } else if (TypeChecker.isBoolean(data)) {
      return {id, type: "boolean", value: data} as IBooleanValue;
    } else {
      throw new ConvergenceError("Unsupported data type found within model data: " + typeof data);
    }
  }
}
