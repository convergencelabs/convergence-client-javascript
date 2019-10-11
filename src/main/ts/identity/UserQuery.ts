import {OrderBy} from "../util/";
import {UserField} from "./IdentityService";

/**
 * A configuration for a query for [[DomainUser]]s. [[term]] and [[fields]] are
 * required.
 *
 * See the [developer guide](https://docs.convergence.io/guide/identity/overview.html)
 * for an example.
 *
 * @category Users and Identity
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
