/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "LICENSE" and
 * "LICENSE.LGPL" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

import {TypeChecker} from "./TypeChecker";

/**
 * @hidden
 * @internal
 */
export class Validation {

  public static isSet(value: any): boolean {
    return !Validation.isNotSet(value);
  }

  public static isNotSet(value: any): boolean {
    return value === undefined || value === null;
  }

  public static nonEmptyString(value: string): boolean {
    return typeof value === "string" && value.length > 0;
  }

  public static assertNonEmptyString(value: string, name?: string): void {
    if (name === undefined) {
      name = "value";
    }

    if (!Validation.nonEmptyString(value)) {
      throw new Error(name + " must be a non-empty string: " + typeof value);
    }
  }

  public static assertString(value: string, name?: string): void {
    if (typeof value !== "string") {
      throw new Error(`${Validation.getValueName(name)} must be a string: ${typeof value}`);
    }
  }

  public static assertValidStringIndex(index: number, str: string, inclusiveEnd: boolean, name?: string): void {
    Validation.assertValidIndex(index, 0, inclusiveEnd ? str.length + 1 : str.length, name);
  }

  public static assertNumber(value: number, name?: string): void {
    if (typeof value !== "number") {
      throw new Error(`${Validation.getValueName(name)} must be a number: ${typeof value}`);
    }
  }

  public static assertArray(value: any[], name?: string): void {
    if (!Array.isArray(value)) {
      throw new Error(`${Validation.getValueName(name)} must be an array: ${typeof value}`);
    }
  }

  public static assertNonEmptyArray(value: any[], name?: string): void {
    Validation.assertArray(value, name);
    if (value.length === 0) {
      throw new Error(`${Validation.getValueName(name)} must be a non-empty array: ${typeof value}`);
    }
  }

  public static assertValidArrayIndex(index: number, array: any[], name?: string): void {
    Validation.assertValidIndex(index, 0, array.length, name);
  }

  public static assertValidIndex(index: number, lower: number, upper: number, name?: string): void {
    Validation.assertNumber(index, name);
    if (index < lower || index >= upper) {
      name = Validation.getValueName(name);
      throw new Error(
        `Index out of bounds. ${name} must be > 0 and <= ${upper}: ${index}`);
    }
  }

  public static assertBoolean(value: boolean, name?: string): void {
    if (typeof value !== "boolean") {
      throw new Error(`${Validation.getValueName(name)} must be a boolean but was: ${typeof value}`);
    }
  }

  public static assertDate(value: Date, name?: string): void {
    if (!TypeChecker.isDate(value)) {
      throw new Error(`${Validation.getValueName(name)} must be a Date but was: ${(value as any).constructor.name}`);
    }
  }

  private static getValueName(name?: string, defaultValue?: string): string {
    return name || defaultValue || "value";
  }

}
