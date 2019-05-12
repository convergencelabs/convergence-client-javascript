/**
 * PagedData represents a set of data from Convergence that is
 * paged using and offset. It contains the current window of data,
 * the offset at which the data starts, and the total results.
 */
export class PagedData<T> {
  /**
   * @param data
   *   The current page of data.
   * @param offset
   *  The index into the total result set of the first element in the data.
   * @param totalResults
   *   The total number of results in the entire data set.
   */
  constructor(
    /**
     * The current page of data.
     */
    public readonly data: T[],
    /**
     * The index into the total result set of the first element in the data.
     */
    public readonly offset: number,
    /**
     *  The total number of results in the entire data set.
     */
    public readonly totalResults: number
  ) {
    Object.freeze(this);
    Object.freeze(data);
  }
}
