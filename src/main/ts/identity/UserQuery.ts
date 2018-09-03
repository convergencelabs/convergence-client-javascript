import {OrderBy} from "../util/";

export declare interface UserQuery {
  term: string;
  fields: string | string[];
  offset?: number;
  limit?: number;
  orderBy?: OrderBy;
}
