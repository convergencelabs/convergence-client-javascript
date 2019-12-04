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

import {IModelStore, IStorageAdapter} from "./api";
import {Logger} from "../util/log/Logger";
import {Logging} from "../util/log/Logging";

/**
 * @hidden
 * @internal
 */
export class StorageEngine {
  private readonly _log: Logger = Logging.logger("storage");
  private _storage: IStorageAdapter | null = null;
  private _storageKey: string | null;

  public configure(storage: IStorageAdapter): void {
    this._log.debug("Initializing storage engine: " + storage.adapterId());

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
