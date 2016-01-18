module convergence.ot {
  export class PathComparator {
    /**
     * Determines if the two paths are equal.  Paths are equal if they are of the
     * same length and contain equal elements at all positions.
     *
     * @param p1 The first path to compare.
     * @param p2 The second path to compare.
     *
     * @return True if the two path lists represent the same path, false otherwise.
     */
    static areEqual(p1:Array<string | number>, p2:Array<string | number>):boolean {
      return (p1.length == p2.length) && p1.every(function (element, index) {
          return element === p2[index];
        });
    }

    /**
     * Determines if the first path passed in is the direct child of the second
     * path passed in.  A path is a direct child of another if the child path
     * is exactly one element longer than the parent AND if for each element in
     * the parent path there is an equal element in the child path at the same
     * position.
     *
     * @param p1 The potential child path.
     * @param p2 The potential parent path.
     *
     * @return True if the p1 is a direct child of p2
     */
    static isChildOf(p1:Array<string | number>, p2:Array<string | number>):boolean {
      if (p1.length != p2.length + 1) {
        return false;
      } else {
        // parent is shorter by one.
        return p2.every(function (element, index) {
          return element === p1[index];
        });
      }
    }

    /**
     * Determines if the first path passed in is the direct parent of the second
     * path passed in.  A path is a direct parent of another if the parent path
     * is exactly one element shorter than the parent AND if for each element in
     * the parent path there is an equal element in the child path at the same
     * position.
     *
     * @param p1 The potential parent path.
     * @param p2 The potential child path.
     *
     * @return True if the p1 is a direct parent of p2
     */
    static isParentOf(p1:Array<string | number>, p2:Array<string | number>):boolean {
      return this.isChildOf(p2, p1)
    }

    /**
     * Determines if the first path passed in is a descendant of the second
     * path passed in.  A path is a descendant of another if the path is
     * longer than the other path AND if for each element in the other path
     * the descendant path has an equal element at the same position.
     *
     * @param p1 The potential descendant path.
     * @param p2 The potential ancestor path.
     *
     * @return True if the p1 is a descendant of p2
     */
    static isDescendantOf(p1:Array<string | number>, p2:Array<string | number>):boolean {
      if (p1.length <= p2.length) {
        return false;
      } else {
        // descendant is longer, so the ancestor length is the potentially common length.
        return p2.every(function (element, index) {
          return element === p1[index];
        });
      }
    }

    /**
     * Determines if the first path passed in is an ancestor of the second
     * path passed in.  A path is a ancestor of another if the path is
     * shorter than the other path AND if for each element in ancestor path the
     * descendant path has an equal element at the same position.
     *
     * @param p1 The potential ancestor path.
     * @param p2 The potential descendant path.
     *
     * @return True if the p1 is a ancestor of p2
     */
    static isAncestorOf(p1:Array<string | number>, p2:Array<string | number>):boolean {
      return this.isDescendantOf(p2, p1);
    }

    /**
     * Determines if two paths are siblings of each other.  Two paths
     * are siblings if they are 1) the same length, 2) contain equal
     * elements at all positions except for the last position and 3)
     * neither are the root path.
     *
     * @param p1 The first path to compare
     * @param p2 The second path to compare
     *
     * @return True if the paths are siblings, false otherwise.
     */
    static areSiblings(p1:Array<string | number>, p2:Array<string | number>):boolean {
      if (p1.length != p2.length) {
        return false;
      } else if (p1.length == 0) {
        return false;
      } else if (p1[p1.length - 1] == p2[p2.length - 1]) {
        return false;
      } else {
        p1.every(function (element, index) {
          return index == p2.length - 1 || element === p1[index];
        })
      }
    }
  }
}