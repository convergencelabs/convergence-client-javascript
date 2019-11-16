/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "LICENSE" and
 * "LICENSE.LGPL" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

import {OrderBy} from "../util";
import {UserField} from "./IdentityService";

/**
 * A configuration for a query for [[DomainUser]]s. [[term]] and [[fields]] are
 * required.
 *
 * See the [developer guide](https://docs.convergence.io/guide/identity/overview.html)
 * for an example.
 *
 * @module Users and Identity
 */
export declare interface UserQuery {
  /**
   * The search query, e.g. `smith`
   */
  term: string;

  /**
   * The field or fields on which to query
   */
  fields: UserField | UserField[];

  /**
   * For pagination, the zero-based offset of query results.  Optional.
   *
   * E.g. To get the second page of ten user results:
   *
   * ```
   * identityService.search({
   *   fields: "lastName",
   *   term: "smith",
   *   offset: 10,
   *   limit: 10
   * })
   * ```
   */
  offset?: number;

  /**
   * An optional maximum number of search results to return.  Useful when there are
   * many potential matches and pagination is desired.
   */
  limit?: number;

  /**
   * An optional configuration for ordering by a given field and direction.
   */
  orderBy?: OrderBy;
}
