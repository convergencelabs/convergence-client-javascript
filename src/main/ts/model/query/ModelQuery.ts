import {Observable, Observer} from "rxjs/Rx";
import {ConvergenceConnection} from "../../connection/ConvergenceConnection";
import {ModelQueryRequest, ModelQueryResponse} from "../../connection/protocol/model/query/modelQuery";
import {ModelResult} from "./ModelResult";

export class ModelQuery {

  private _connection: ConvergenceConnection;
  private _collection: string;
  private _limit: number;
  private _offset: number;
  private _orderByField: string;

  constructor(connection: ConvergenceConnection, options?: ModelQueryOptions) {
    this._connection = connection;
    if (options !== undefined) {
      this._collection = options.collection;
      this._limit = options.limit;
      this._offset = options.offset;
      this._orderByField = options.orderBy;
    }
  }

  collection(collection: string): ModelQuery {
    return this.copy({collection: collection});
  }

  limit(limit: number): ModelQuery {
    return this.copy({limit: limit});
  }

  offset(offset: number): ModelQuery {
    return this.copy({offset: offset});
  }

  orderBy(field: string): ModelQuery {
    return this.copy({orderBy: field});
  }

  private copy(updates: any): ModelQuery {
    var options: ModelQueryOptions = {
      collection: updates.collection !== undefined ? updates.collection : this._collection,
      limit: updates.limit !== undefined ? updates.limit : this._limit,
      offset: updates.offset !== undefined ? updates.offset : this._offset,
      orderBy: updates.orderBy !== undefined ? updates.orderBy : this._orderByField
    };

    return new ModelQuery(this._connection, options);
  }

  execute(): Observable<ModelResult[]> {
    return Observable.create((observer: Observer<ModelResult[]>) => {
      var message: ModelQueryRequest = {
        collection: this._collection,
        limit: this._limit,
        offset: this._offset,
        orderBy: this._orderByField
      };

      this._connection.request(message)
        .then((response: ModelQueryResponse) => {
          observer.next(null);
          observer.complete();
        })
        .catch(e => observer.error(e));
    });
  }
}

export interface ModelQueryOptions {
  collection?: string;
  limit?: number;
  offset?: number;
  orderBy?: string;
}

