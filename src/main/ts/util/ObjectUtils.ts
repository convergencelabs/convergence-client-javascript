export type MapFunction = (val: any) => any;
export const mapObject: (obj: any, mapFunc: MapFunction) => any = (obj: any, mapFunc: MapFunction) => {
  return Object.keys(obj).reduce((newObj: any, value: any) => {
    newObj[value] = mapFunc(obj[value]);
    return newObj;
  }, {});
};

function objectToMap(obj: {[key: string]: any}): Map<string, any>  {
  let map = new Map<string, any>();
  Object.keys(obj).forEach(k => map.set(k, obj[k]));
  return map;
}
export const objectToMap;
