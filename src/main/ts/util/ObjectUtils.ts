export type MapFunction = (val: any) => any;

export function mapObject(obj: any, mapFunc: MapFunction): any {
  "use strict";
  return Object.keys(obj).reduce((newObj: any, value: any) => {
    newObj[value] = mapFunc(obj[value]);
    return newObj;
  }, {});
}

export function objectToMap(obj: {[key: string]: any}): Map<string, any> {
  "use strict";
  const map: Map<string, any> = new Map<string, any>();
  Object.keys(obj).forEach(k => map.set(k, obj[k]));
  return map;
}

export function mapToObject(map: Map<string, any>): {[key: string]: any} {
  "use strict";
  let obj: {[key: string]: any} = {};
  map.forEach((v, k) => obj[k] = v);
  return obj;
}
