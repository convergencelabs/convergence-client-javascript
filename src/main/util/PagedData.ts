/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "LICENSE" and
 * "COPYING.LESSER" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

/**
 * PagedData represents a read-only set of data from Convergence that is
 * paged using an offset. It contains the current window of data,
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
