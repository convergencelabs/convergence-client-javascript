import {OrderBy} from "../../util/OrderBy";

export interface ModelQuery {
  collection?: string;
  limit?: number;
  offset?: number;
  orderBy?: OrderBy;
}
