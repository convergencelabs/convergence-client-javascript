/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "COPYING" and
 * "COPYING.LESSER" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

import {toVoidPromise, txToPromise} from "./promise";

const READONLY = "readonly";
const READWRITE = "readwrite";

/**
 * @hidden
 * @internal
 */
export class IdbPersistenceStore {

  protected static deleteFromIndex(store: IDBObjectStore, index: string, range: IDBKeyRange): Promise<void> {
    const onNext = (cursor: IDBCursorWithValue) => {
      cursor.delete();
    };

    return this._cursorIterator(store, index, onNext, range);
  }

  protected static _cursorIterator(objectStore: IDBObjectStore,
                                   indexName: string | null,
                                   onNext: (cursor: IDBCursorWithValue) => void,
                                   query?: IDBValidKey | IDBKeyRange | null,
                                   direction?: IDBCursorDirection): Promise<void> {
    return new Promise((resolve, reject) => {
      let request: IDBRequest<IDBCursorWithValue | null> = null;

      if (indexName === null) {
        request = objectStore.openCursor();
      } else {
        const index = objectStore.index(indexName);
        request = index.openCursor(query, direction);
      }

      request.onsuccess = (event) => {
        // For some reason the typings don't have the result on the target.
        const cursor: IDBCursorWithValue | null = (event.target as IDBRequest).result;
        if (cursor) {
          onNext(cursor);
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  protected _db: IDBDatabase;

  constructor(db: IDBDatabase) {
    this._db = db;
  }

  protected _withWriteStore<T>(
    store: string,
    body: (store: IDBObjectStore) => Promise<T>): Promise<T> {
    return this._withStores([store], READWRITE, (stores) => body(stores[0]));
  }

  protected _withReadStore<T>(
    store: string,
    body: (store: IDBObjectStore) => Promise<T>): Promise<T> {
    return this._withStores([store], READONLY, (stores) => body(stores[0]));
  }

  protected _withWriteStores<T>(
    stores: string[],
    body: (stores: IDBObjectStore[]) => Promise<T>): Promise<T> {
    return this._withStores(stores, READWRITE, body);
  }

  protected _withReadStores<T>(
    stores: string[],
    body: (stores: IDBObjectStore[]) => Promise<T>): Promise<T> {
    return this._withStores(stores, READONLY, body);
  }

  protected _withStores<T>(
    stores: string[],
    mode: IDBTransactionMode,
    body: (stores: IDBObjectStore[]) => Promise<T>): Promise<T> {
    const tx = this._db.transaction(stores, mode);
    const objectStores = stores.map(storeName => tx.objectStore(storeName));

    const result: Promise<T> = body(objectStores)
      .catch(e => {
        tx.abort();
        return Promise.reject(e);
      });

    return Promise.all([result, txToPromise(tx)]).then(([r, _]) => r);
  }

  protected put(storeName: string, data: any): Promise<void> {
    return this._withWriteStore(storeName, (store) => {
      return toVoidPromise(store.put(data));
    });
  }

  protected add(storeName: string, data: any): Promise<void> {
    return this._withWriteStore(storeName, (store) => {
      return toVoidPromise(store.add(data));
    });
  }

  protected _getAll<T extends any>(storeName: string, query?: IDBValidKey | IDBKeyRange | null): Promise<T[]> {
    const results: T[] = [];
    return this._readIterator<T>(storeName, null, (value: T) => {
      results.push(value);
    }, query).then(() => results);
  }

  protected _readIterator<T extends any>(storeName: string,
                                         indexName: string | null,
                                         onNext: (value: T) => void,
                                         query?: IDBValidKey | IDBKeyRange | null,
                                         direction?: IDBCursorDirection): Promise<void> {
    const nextValue = (cursor: IDBCursorWithValue) => {
      onNext(cursor.value);
    };

    return this._withReadStore(storeName, objectStore => {
      return IdbPersistenceStore._cursorIterator(objectStore, indexName, nextValue, query, direction);
    });
  }

  protected _deleteIterator<T extends any>(storeName: string,
                                           indexName: string | null,
                                           query?: IDBValidKey | IDBKeyRange | null,
                                           direction?: IDBCursorDirection): Promise<void> {
    const onNext = (cursor: IDBCursorWithValue) => {
      cursor.delete();
    };

    return this._writeIterator(storeName, indexName, onNext, query, direction);
  }

  protected _writeIterator<T extends any>(storeName: string,
                                          indexName: string | null,
                                          onNext: (cursor: IDBCursorWithValue) => void,
                                          query?: IDBValidKey | IDBKeyRange | null,
                                          direction?: IDBCursorDirection): Promise<void> {
    return this._withWriteStore(storeName, objectStore => {
      return IdbPersistenceStore._cursorIterator(objectStore, indexName, onNext, query, direction);
    });
  }
}
