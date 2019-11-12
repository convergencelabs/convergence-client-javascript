/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {toPromise, toVoidPromise, txToPromise} from "./promise";

const READONLY = "readonly";
const READWRITE = "readwrite";

/**
 * @hidden
 * @internal
 */
export class IdbPersistenceStore {

  protected static deleteFromIndex(store: IDBObjectStore, index: string, range: IDBKeyRange): void {
    const idx = store.index(index);
    toPromise(idx.openCursor(range)).then(cursor => {
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    });
  }

  protected _db: IDBDatabase;

  constructor(db: IDBDatabase) {
    this._db = db;
  }

  protected _withWriteStore<T>(
    store: string,
    body: (tx: IDBObjectStore) => Promise<T>): Promise<T> {
    return this._withStores([store], READWRITE, (stores) => body(stores[0]));
  }

  protected _withReadStore<T>(
    store: string,
    body: (tx: IDBObjectStore) => Promise<T>): Promise<T> {
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
    const result = body(objectStores);
    return txToPromise(tx).then(() => result);
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
}
