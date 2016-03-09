export class IndexTransformer {
  static handleInsert(indices: number[], insertIndex: number, length: number): number[] {
    return indices.map((index: number) => {
      if (index >= insertIndex) {
        return index + length;
      } else {
        return index;
      }
    });
  }

  static handleReorder(indices: number[], fromIndex: number, toIndex: number): number[] {
    return indices.map((index: number) => {
      if (index >= toIndex && index < fromIndex) {
        return index + 1;
      } else if (index >= fromIndex && index < toIndex) {
        return index - 1;
      }
    });
  }

  static handleRemove(indices: number[], removeIndex: number, length: number): number[] {
    return indices.map((index: number) => {
      if (index > removeIndex) {
        return index - Math.min(index - removeIndex, length);
      } else {
        return index;
      }
    });
  }
}
