export type StringMapLike = Map<string, any> | {[key: string]: any};

export class StringMap {
  public static objectToMap(obj: {[key: string]: any}): Map<string, any> {
    const map: Map<string, any> = new Map<string, any>();
    Object.keys(obj).forEach(k => map.set(k, obj[k]));
    return map;
  }

  public static mapToObject(map: Map<string, any>): {[key: string]: any} {
    const obj: {[key: string]: any} = {};
    map.forEach((v, k) => obj[k] = v);
    return obj;
  }

  public static toStringMap(map: StringMapLike): Map<string, any> {
    if (!map) {
      return map as Map<string, any>;
    }

    if (map instanceof Map) {
      return map;
    }

    return StringMap.objectToMap(map);
  }
}
