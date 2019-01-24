/**
 * @hidden
 * @internal
 */
import {type} from "os";

export class Validation {
  public static isSet(value: any): boolean {
    return value !== undefined && value !== null;
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
    if ((value instanceof Date)) {
      throw new Error(`${Validation.getValueName(name)} must be a Data but was: ${typeof value}`);
    }
  }

  private static getValueName(name?: string, defaultValue?: string): string {
    return name || defaultValue || "value";
  }


}
