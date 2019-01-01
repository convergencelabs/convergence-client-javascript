/**
 * @hidden
 * @internal
 */
export type MapFunction<F, T> = (val: F) => T;

/**
 * @hidden
 * @internal
 */
export function mapObjectValues<F, T>(obj: {[key: string]: F}, mapFunc: MapFunction<F, T>): {[key: string]: T} {
  "use strict";
  return Object.keys(obj).reduce((newObj: any, value: any) => {
    newObj[value] = mapFunc(obj[value]);
    return newObj;
  }, {});
}

/**
 * @hidden
 * @internal
 */
export function deepClone(from: any): any {
  const type: string = typeof from;

  // Primitive types
  if (from === null || from === undefined || type === "string" || type === "number" || type === "boolean") {
    return from;
  }

  // Handle Date
  if (from instanceof Date) {
    return new Date(from.getTime());
  }

  // Handle Array
  if (Array.isArray(from)) {
    return from.map(e => deepClone(e));
  }

  if (from instanceof Map) {
    const result = new Map();
    from.forEach((v, k) => {
      result.set(k, deepClone(v));
    });
    return result;
  }

  if (from instanceof Set) {
    const result = new Set();
    from.forEach(v => result.add(deepClone(v)));
    return result;
  }

  // Handle Object
  if (from.constructor === Object) {
    const result: {[key: string]: any} = {};
    Object.keys(from).forEach(key => {
      result[key] = deepClone(from[key]);
    });
    return result;
  }

  const name: string = from.constructor.name || from.constructor.toString();
  throw new Error("Can not clone unknown type: " + name);
}
