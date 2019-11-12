/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

/**
 * Use this to indicate a desire to have search results ordered by the given field and
 * direction.
 *
 * Queries are in ascending order by default.
 */
export interface OrderBy {
  /**
   * The field to sort on
   */
  field: string;

  /**
   * Set to true if the results should be in ascending order, false for descending order
   */
  ascending?: boolean;
}
