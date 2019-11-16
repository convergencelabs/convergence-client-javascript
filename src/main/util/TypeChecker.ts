/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "LICENSE" and
 * "COPYING.LESSER" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

/**
 * @internal
 * @hidden
 */
export class TypeChecker {
  public static isArray(value: any): value is any[] {
    return Array.isArray(value);
  }

  public static isBoolean(value: any): value is boolean {
    return typeof value === "boolean";
  }

  public static isDate(value: any): value is Date {
    return value instanceof Date || value.constructor.name === "Date";
  }

  public static isError(value: any): value is Error {
    return value instanceof Error && typeof value.message !== "undefined";
  }

  public static isFunction(value: any): value is (...args: any[]) => any {
    return typeof value === "function";
  }

  public static isNull(value: any): value is null {
    return value === null;
  }

  public static isNumber(value: any): value is number {
    return typeof value === "number" && isFinite(value);
  }

  public static isObject(value: any): value is any {
    return value && typeof value === "object" && value.constructor === Object;
  }

  public static isString(value: any): value is string {
    return typeof value === "string" || value instanceof String;
  }

  public static isSymbol(value: any): value is any {
    return typeof value === "symbol";
  }

  public static isRegExp(value: any): value is RegExp {
    return value && typeof value === "object" && value.constructor === RegExp;
  }

  public static isUndefined(value: any): value is undefined {
    return typeof value === "undefined";
  }

  public static isSet(value: any): value is any {
    return !TypeChecker.isNull(value) && !TypeChecker.isUndefined(value);
  }

  public static isNotSet(value: any): value is any {
    return !TypeChecker.isSet(value);
  }

  public static switch(value: any, matcher: ITypeMatch): void {
    if (TypeChecker.isUndefined(matcher) || TypeChecker.isNull(matcher)) {
      throw new Error("matcher must be defined.");
    }

    if (TypeChecker.isArray(value) && !TypeChecker.isUndefined(matcher.array)) {
      matcher.array(value);
    } else if (TypeChecker.isBoolean(value) && !TypeChecker.isUndefined(matcher.boolean)) {
      matcher.boolean(value);
    } else if (TypeChecker.isError(value) && !TypeChecker.isUndefined(matcher.error)) {
      matcher.error(value);
    } else if (TypeChecker.isDate(value) && !TypeChecker.isUndefined(matcher.date)) {
      matcher.date(value);
    } else if (TypeChecker.isFunction(value) && !TypeChecker.isUndefined(matcher.function)) {
      matcher.function(value);
    } else if (TypeChecker.isNull(value) && !TypeChecker.isUndefined(matcher.null)) {
      matcher.null();
    } else if (TypeChecker.isNumber(value) && !TypeChecker.isUndefined(matcher.number)) {
      matcher.number(value);
    } else if (TypeChecker.isObject(value) && !TypeChecker.isUndefined(matcher.object)) {
      matcher.object(value);
    } else if (TypeChecker.isRegExp(value) && !TypeChecker.isUndefined(matcher.regexp)) {
      matcher.regexp(value);
    } else if (TypeChecker.isString(value) && !TypeChecker.isUndefined(matcher.string)) {
      matcher.string(value);
    } else if (TypeChecker.isSymbol(value) && !TypeChecker.isUndefined(matcher.symbol)) {
      matcher.symbol(value);
    } else if (TypeChecker.isUndefined(value) && !TypeChecker.isUndefined(matcher.undefined)) {
      matcher.undefined();
    } else {
      const customRule: ICustomTypeMatchRule<any> | undefined =
        TypeChecker.isArray(matcher.custom) ?
          matcher.custom.find(rule => {
            return TypeChecker.isFunction(rule.test) &&
              TypeChecker.isFunction(rule.callback) &&
              rule.test(value);
          }) :
          undefined;

      if (!TypeChecker.isUndefined(customRule)) {
        customRule.callback(value);
      } else if (!TypeChecker.isUndefined(matcher.default)) {
        matcher.default(value);
      }
    }
  }
}

/**
 * @hidden
 * @internal
 */
export interface ITypeMatch {
  array?: (value: any[]) => void;
  boolean?: (value: boolean) => void;
  error?: (value: Error) => void;
  date?: (value: Date) => void;
  function?: (value: (...args: any[]) => any) => void;
  null?: () => void;
  number?: (value: number) => void;
  object?: (value: any) => void;
  regexp?: (value: RegExp) => void;
  string?: (value: string) => void;
  symbol?: (value: any) => void;
  undefined?: () => void;
  default?: (value: any) => void;
  custom?: Array<ICustomTypeMatchRule<any>>;
}

/**
 * @hidden
 * @internal
 */
export interface ICustomTypeMatchRule<T> {
  test(value: any): boolean;

  callback(value: T): void;
}
