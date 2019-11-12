/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {IModelStore, IStorageAdapter} from "./api";
import {Logger} from "../util/log/Logger";
import {Logging} from "../util/log/Logging";

/**
 * @hidden
 * @internal
 */
export class StorageEngine {
  private static _log: Logger = Logging.logger("storage");
  private _storage: IStorageAdapter | null = null;
  private _storageKey: string | null;

  public configure(storage: IStorageAdapter): void {
    if (!storage) {
      throw new Error("storage must be specified");
    }

    this._storage = storage;
  }

  public openStore(namespace: string, domainId: string, username: string, storageKey?: string): Promise<string> {
    return this._storage.openStore(namespace, domainId, username, storageKey);
  }

  public storageKey(): string | null {
    return this._storageKey;
  }

  public isEnabled(): boolean {
    return this._storage !== null;
  }

  public isInitialized(): boolean {
    return this._storage !== null && this._storage.isInitialized();
  }

  public dispose(): void {
    if (!this.isInitialized()) {
      throw new Error("Can not disposed a storage adapter that is not initialized");
    }

    if (this.isDisposed()) {
      throw new Error("Already disposed");
    }

    this._storage.dispose();
  }

  public isDisposed(): boolean {
    return this._storage !== null && this._storage.isDisposed();
  }

  public modelStore(): IModelStore {
    return this._storage.modelStore();
  }
}
