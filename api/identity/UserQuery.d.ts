import {OrderBy} from "../util/OrderBy";

export declare interface UserQuery {
  term: string;
  fields: string | string[];
  offset?: number;
  limit?: number
  orderBy?: OrderBy;
}
