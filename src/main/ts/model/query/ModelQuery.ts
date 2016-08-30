import {Observable, Observer} from "rxjs/Rx";
import {ConvergenceConnection} from "../../connection/ConvergenceConnection";
import {ModelsQueryRequest, ModelsQueryResponse} from "../../connection/protocol/model/query/modelQuery";
import {ModelResult} from "./ModelResult";
import {MessageType} from "../../connection/protocol/MessageType";

export interface OrderBy {
  field: string;
  ascending?: boolean;
}

export class ModelQuery {

  private _connection: ConvergenceConnection;
  private _collection: string;
  private _limit: number;
  private _offset: number;
  private _orderBy: OrderBy;

  constructor(connection: ConvergenceConnection, options?: ModelQueryOptions) {
    this._connection = connection;
    if (options !== undefined) {
      this._collection = options.collection;
      this._limit = options.limit;
      this._offset = options.offset;
      this._orderBy = options.orderBy;
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

  orderBy(field: string, ascending?: boolean): ModelQuery {
    return this.copy(
      {
        orderBy: {
          field: field,
          ascending: (ascending !== undefined && ascending !== null) ? ascending : true
        }
      });
  }

  private copy(updates: any): ModelQuery {
    var options: ModelQueryOptions = {
      collection: updates.collection !== undefined ? updates.collection : this._collection,
      limit: updates.limit !== undefined ? updates.limit : this._limit,
      offset: updates.offset !== undefined ? updates.offset : this._offset,
      orderBy: updates.orderBy !== undefined ? updates.orderBy : this._orderBy,
    };

    return new ModelQuery(this._connection, options);
  }

  execute(): Observable<ModelResult[]> {
    return Observable.create((observer: Observer<ModelResult[]>) => {
      var message: ModelsQueryRequest = {
        type: MessageType.MODELS_QUERY_REQUEST,
        collection: this._collection,
        limit: this._limit,
        offset: this._offset,
        orderBy: this._orderBy
      };

      this._connection.request(message)
        .then((response: ModelsQueryResponse) => {
          observer.next(response.result);
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
  orderBy?: OrderBy;
}

