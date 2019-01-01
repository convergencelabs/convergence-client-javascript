import {OrderBy} from "../util/";
import {UserField} from "./IdentityService";

export declare interface UserQuery {
  term: string;
  fields: UserField | UserField[];
  offset?: number;
  limit?: number;
  orderBy?: OrderBy;
}
