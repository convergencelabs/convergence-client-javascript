export type MapFunction = (val: any) => any;
export var mapObject: (obj: any, mapFunc: MapFunction) => any = (obj: any, mapFunc: MapFunction) => {
  return Object.keys(obj).reduce((newObj: any, value: any) => {
    newObj[value] = mapFunc(obj[value]);
    return newObj;
  }, {});
};
