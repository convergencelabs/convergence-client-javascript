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

import {IdbStorageAdapter} from "../../../main/storage/idb";
import {IModelState} from "../../../main/storage/api/";

import {expect} from "chai";
import "fake-indexeddb/auto";

describe("IdbModelStore", () => {
  describe("modelExists()", () => {
    it("returns false for a model that does not exist", () => withStorage(async (adapter) => {
        const modelStore = adapter.modelStore();
        const modelState = createModelState();
        const exists = await modelStore.modelExists(modelState.snapshot.modelId);
        expect(exists).to.be.false;
      })
    );

    it("returns true for a model that does not exist", () => withStorage(async (adapter) => {
        const modelStore = adapter.modelStore();
        const modelState = createModelState();
        await modelStore.putModelState(modelState);
        const exists = await modelStore.modelExists(modelState.snapshot.modelId);
        expect(exists).to.be.true;
      })
    );
  });

  describe("putModel()", () => {
    it("stores the correct model", () => withStorage(async (adapter) => {
        const modelStore = adapter.modelStore();
        const modelState = createModelState();
        await modelStore.putModelState(modelState);
        const retrieved = await modelStore.getModelState(modelState.snapshot.modelId);
        expect(retrieved).to.deep.equal(modelState);
      })
    );
  });

  describe("deleteModel()", () => {
    it("deletes and existing model ", () => withStorage(async (adapter) => {
        const modelStore = adapter.modelStore();
        const modelState = createModelState();
        await modelStore.putModelState(modelState);
        const exists = await modelStore.modelExists(modelState.snapshot.modelId);
        expect(exists).to.be.true;

        await modelStore.removeSubscriptions([modelState.snapshot.modelId]);
        const afterDelete = await modelStore.modelExists(modelState.snapshot.modelId);
        expect(afterDelete).to.be.false;
      })
    );
  });
});

let modelCounter = 1;

function createModelState(): IModelState {
  return {
    version: 10,
    snapshot: {
      modelId: "modelId" + modelCounter++,
      collection: "collection",
      local: false,
      dirty: false,
      subscribed: false,
      dataVersion: 10,
      seqNo: 0,
      createdTime: new Date(),
      modifiedTime: new Date(),
      data: {
        type: "object",
        id: "1:0",
        children: {}
      },
      permissions: {read: true, write: true, remove: true, manage: true}
    },
    localOperations: [],
    serverOperations: []
  };
}

let counter = 1;

function withStorage(body: (IdbStorageAdapter) => Promise<any>): Promise<any> {
  const adapter = new IdbStorageAdapter();
  return adapter.openStore("namespace", "domain" + counter++, "someuser")
    .then(() => body(adapter))
    .then(() => {
      adapter.destroy();
      return Promise.resolve();
    })
    .catch((e) => {
      adapter.destroy();
      return Promise.reject(e);
    });
}
