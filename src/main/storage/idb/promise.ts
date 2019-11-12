/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

/**
 * @hidden
 * @internal
 */
export function toPromise<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => {
      resolve(req.result);
    };

    req.onerror = () => {
      reject(req.error);
    };
  });
}

/**
 * @hidden
 * @internal
 */
export function toVoidPromise(req: IDBRequest<any>): Promise<void> {
  return toPromise(req).then(() => undefined);
}

/**
 * @hidden
 * @internal
 */
export function txToPromise(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => {
      resolve();
    };

    tx.onerror = () => {
      reject(tx.error);
    };

    tx.onabort = () => {
      reject(tx.error);
    };
  });
}
