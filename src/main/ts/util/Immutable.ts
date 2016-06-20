export default class Immutable {

  static make(source: any): void {
    if (typeof source === 'object') {
      Object.freeze(source);
      Object.keys(source).forEach(function (val: any, idx: number, array: Array<any>): void {
        Immutable.make(val);
      });
    }
  }

  static copy(source: any, updates?: any): any {
    var result: any = {};
    Object.keys(source).forEach(function (prop: any, idx: number, array: Array<any>): void {
      if (updates[prop] !== undefined) {
        result[prop] = updates[prop];
      } else {
        result[prop] = source[prop];
      }
    });

    // we do a shallow freeze here since we assume that the whole thing was
    // already immutable.
    Object.freeze(result);
    return result;
  }

  static update(current: any, update: any): any {
    return update !== undefined ? update : current;
  }
}
