import {Observable} from "rxjs/Rx";
import {ModelResult} from "./ModelResult";

export interface OrderBy {
  field: string;
  ascending?: boolean;
}

export declare class ModelQuery {
  collection(collection: string): ModelQuery;

  limit(limit: number): ModelQuery;

  offset(offset: number): ModelQuery;

  orderBy(field: string, ascending?: boolean): ModelQuery;

  execute(): Observable<ModelResult[]>;
}

export interface ModelQueryOptions {
  collection?: string;
  limit?: number;
  offset?: number;
  orderBy?: OrderBy;
}
