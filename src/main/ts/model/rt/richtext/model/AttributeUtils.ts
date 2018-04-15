export class AttributeUtils {
  public static areAttributesEqual(a: Map<string, any>, b: Map<string, any>): boolean {
    if (a.size !== b.size) {
      return false;
    } else {
      let equal = true;
      for (let v of a) {
        if (b.get(v[0]) !== v[1]) {
          equal = false;
          break;
        }
      }
      return equal;
    }
  }
}
