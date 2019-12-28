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

import {IModelStore} from "./IModelStore";
import {IIdentityStore} from "./IIdentityStore";

/**
 * @module Offline
 */
export interface IStorageAdapter {
  /**
   * Returns the unique id of this storage adapter. Each adapter class
   * implementation must provide a unique id.
   */
  adapterId(): string;

  /**
   * Initializes the offline data store. The storage will be created
   * if it does not exists.
   *
   * @param namespace The namespace of the domain being opened.
   * @param domainId The id of the domain being opened.
   * @param username The user name of the user opening the store.
   */
  initialize(namespace: string, domainId: string, username: string): Promise<void>;

  /**
   * Determines if the storage is initialized.
   *
   * @returns true if the storage is initialized, false otherwise.
   */
  isInitialized(): boolean;

  /**
   * Disposes of this storage adapter, releasing any resources. Calls
   * to the storage after calling dispose will likely throw errors.
   */
  dispose(): void;

  /**
   * Determines if the storage is disposed.
   *
   * @returns true if the storage is disposed, false otherwise.
   */
  isDisposed(): boolean;

  /**
   * Removes the underlying storage behind this store, deleting all data.
   * The storage adapter will be disposed after calling destroy.
   */
  destroy(): void;

  /**
   * Returns the model store which provides storage for the Real Time
   * Model subsystem.
   *
   * @returns The model store.
   */
  modelStore(): IModelStore;

  /**
   * Returns the identity store which provides storage for the Identity
   * subsystem.
   *
   * @returns The identity store.
   */
  identityStore(): IIdentityStore;
}
