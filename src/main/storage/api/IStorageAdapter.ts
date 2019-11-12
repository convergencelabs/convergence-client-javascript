/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {IModelStore} from "./IModelStore";
import {IMetaStore} from "./IMetaStore";

/**
 * @module Offline
 */
export interface IStorageAdapter {
  openStore(namespace: string, domainId: string, username: string, storageKey?: string): Promise<string>;

  isInitialized(): boolean;

  dispose(): void;

  isDisposed(): boolean;

  destroy(): void;

  modelStore(): IModelStore;

  metaStore(): IMetaStore;
}
