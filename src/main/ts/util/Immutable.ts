export class Immutable {

  public static make(source: any): void {
    if (typeof source === "object") {
      Object.freeze(source);
      Object.keys(source).forEach((val: any, idx: number, array: any[]) => {
        Immutable.make(val);
      });
    }
  }

  public static copy(source: any, updates?: any): any {
    const result: any = {};
    Object.keys(source).forEach((prop: any, idx: number, array: any[]) => {
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

  public static update(current: any, update: any): any {
    return update !== undefined ? update : current;
  }
}
