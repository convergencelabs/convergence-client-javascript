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

import {createStubInstance} from "sinon";
import {IdbStorageAdapter, IIdentityStore, IModelStore, IStorageAdapter} from "../main";
import {StorageEngine} from "../main/storage/StorageEngine";
import {IdbModelStore} from "../main/storage/idb/IdbModelStore";
import {IdbIdentityStore} from "../main/storage/idb/IdbIdentityStore";

export interface IMockedStorage {
  engine: StorageEngine;
  adapterStub: sinon.SinonStubbedInstance<IStorageAdapter>;
  modelStoreStub: sinon.SinonStubbedInstance<IModelStore>;
  identityStoreStub: sinon.SinonStubbedInstance<IIdentityStore>;
}

export function mockStorageEngine(): IMockedStorage {
  const engine = new StorageEngine();
  const adapterStub = createStubInstance(IdbStorageAdapter);
  const modelStoreStub = createStubInstance(IdbModelStore);
  const identityStoreStub = createStubInstance(IdbIdentityStore);
  adapterStub.modelStore.returns(modelStoreStub);

  engine.configure(adapterStub);

  return {
    engine,
    adapterStub,
    modelStoreStub,
    identityStoreStub
  };
}
