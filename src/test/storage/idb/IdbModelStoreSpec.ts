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
import {ILocalOperationData, IModelCreationData, IModelMetaData, IModelState} from "../../../main/storage/api/";
import {ModelPermissions} from "../../../main/model/";

import {expect} from "chai";
// tslint:disable-next-line:no-duplicate-imports
import * as chai from "chai";
import "fake-indexeddb/auto";
import * as chaiAsPromised from "chai-as-promised";
import {fail} from "assert";

chai.use(chaiAsPromised);

describe("IdbModelStore", () => {

  describe("initiateModelCreation()", () => {
    it("returns the correct metadata", () => withStorage(async (adapter: IdbStorageAdapter) => {
        const modelStore = adapter.modelStore();

        const created: IModelMetaData = await modelStore.initiateModelCreation(DefaultModelCreationData);
        const expected: IModelMetaData = {
          modelId: DefaultModelCreationData.modelId,
          available: true,
          created: true,
          subscribed: false,
          uncommitted: false,
          syncRequired: true,
          deleted: false,
          details: {
            collection: DefaultModelCreationData.collection,
            valueIdPrefix: {prefix: DefaultModelCreationData.valueIdPrefix, increment: 0},
            version: 1,
            lastSequenceNumber: 0,

            createdTime: DefaultModelCreationData.createdTime,
            modifiedTime: DefaultModelCreationData.createdTime,
            permissions: new ModelPermissions(true, true, true, true),

            snapshotVersion: 1,
            snapshotSequenceNumber: 0
          }
        }
        expect(created).to.deep.equals(expected);

        const read: IModelMetaData = await modelStore.getModelMetaData(DefaultModelCreationData.modelId);
        expect(read).to.deep.equals(expected);
      })
    );

    it("returns an error for an already created model", () => withStorage(async (adapter: IdbStorageAdapter) => {
      const modelStore = adapter.modelStore();
      await modelStore.initiateModelCreation(DefaultModelCreationData);

      try {
        await modelStore.initiateModelCreation(DefaultModelCreationData);
        fail("should have thrown an error");
      } catch (e) {
        // no-op
      }
    }));
  });

  describe("completeModelCreation()", () => {
    it("throws error if creation not in progress", () => withStorage(async (adapter: IdbStorageAdapter) => {
      try {
        const modelStore = adapter.modelStore();
        await modelStore.completeModelCreation("not-created");
        fail("should have thrown an error");
      } catch (e) {
        // no-op
      }
    }));

    it("correctly removes create data", () => withStorage(async (adapter: IdbStorageAdapter) => {
      const modelStore = adapter.modelStore();
      await modelStore.initiateModelCreation(DefaultModelCreationData);
      await modelStore.completeModelCreation(DefaultModelCreationData.modelId);
      const createData = await modelStore.getModelCreationData(DefaultModelCreationData.modelId);
      expect(createData).to.be.undefined;
    }));

    it("correctly updated model meta data", () => withStorage(async (adapter: IdbStorageAdapter) => {
      const modelStore = adapter.modelStore();
      await modelStore.initiateModelCreation(DefaultModelCreationData);
      await modelStore.completeModelCreation(DefaultModelCreationData.modelId);
      const metaData = await modelStore.getModelMetaData(DefaultModelCreationData.modelId);
      const expectedMetaData: IModelMetaData = {
        modelId: DefaultModelCreationData.modelId,
        available: true,
        created: false,
        subscribed: false,
        uncommitted: false,
        syncRequired: false,
        deleted: false,
        details: {
          collection: DefaultModelCreationData.collection,
          valueIdPrefix: {prefix: DefaultModelCreationData.valueIdPrefix, increment: 0},
          version: 1,
          lastSequenceNumber: 0,

          createdTime: DefaultModelCreationData.createdTime,
          modifiedTime: DefaultModelCreationData.createdTime,
          permissions: new ModelPermissions(true, true, true, true),

          snapshotVersion: 1,
          snapshotSequenceNumber: 0
        }
      }
      expect(metaData).to.deep.equals(expectedMetaData);
    }));
  });

  describe("getModelCreationData()", () => {
    it("returns correct data for a model that does not exist", () => withStorage(async (adapter: IdbStorageAdapter) => {
      const modelStore = adapter.modelStore();
      await modelStore.initiateModelCreation(DefaultModelCreationData);
      const createData = await modelStore.getModelCreationData(DefaultModelCreationData.modelId);
      expect(createData).to.deep.equal(DefaultModelCreationData);
    }));

    it("returns undefined for a model not being created", () => withStorage(async (adapter) => {
      const modelStore = adapter.modelStore();
      const createData = await modelStore.getModelCreationData(DefaultModelCreationData.modelId);
      expect(createData).to.be.undefined;
    }));
  });

  describe("initiateModelDeletion()", () => {
    it("returns false for a model that does not exist", () => withStorage(async (adapter: IdbStorageAdapter) => {
      const modelStore = adapter.modelStore();
      try {
        await modelStore.initiateModelDeletion("does-not-exist");
        fail("expecting an error when deleting a non-existent model");
      } catch {
        // pass
      }
    }));

    it("removes details and sets meta-data appropriately an existing model", () => withStorage(async (adapter: IdbStorageAdapter) => {
      const modelStore = adapter.modelStore();
      const modelState = createModelState();
      await modelStore.putModelState(modelState);
      await modelStore.updateSubscriptions([modelState.modelId], []);
      await modelStore.initiateModelDeletion(modelState.modelId);
      const afterDelete = await modelStore.getModelMetaData(modelState.modelId);
      const expectedAfterDelete: IModelMetaData = {
        modelId: modelState.modelId,
        subscribed: false,
        available: false,
        created: false,
        syncRequired: true,
        uncommitted: false,
        deleted: true
      };
      expect(afterDelete).to.deep.equal(expectedAfterDelete);
    }));

    it("removes a locally created model", () => withStorage(async (adapter: IdbStorageAdapter) => {
      const modelStore = adapter.modelStore();
      await modelStore.initiateModelCreation(DefaultModelCreationData);
      await modelStore.initiateModelDeletion(DefaultModelCreationData.modelId);
      const afterDelete = await modelStore.getModelMetaData(DefaultModelCreationData.modelId);
      const expectedAfterDelete: IModelMetaData = {
        subscribed: false,
        modelId: DefaultModelCreationData.modelId,
        available: false,
        created: false,
        syncRequired: false,
        uncommitted: false,
        deleted: false
      };
      expect(afterDelete).to.deep.equal(expectedAfterDelete);
    }));
  });

  describe("completeModelDeletion()", () => {
    it("removes the delete flag for a model that is deleting", () => withStorage(async (adapter: IdbStorageAdapter) => {
      const modelStore = adapter.modelStore();
      const modelState = createModelState();
      await modelStore.putModelState(modelState);
      await modelStore.initiateModelDeletion(modelState.modelId);
      await modelStore.completeModelDeletion(modelState.modelId);
      const afterDelete = await modelStore.getModelMetaData(modelState.modelId);
      const expectedAfterDelete: IModelMetaData = {
        modelId: modelState.modelId,
        subscribed: false,
        available: false,
        created: false,
        syncRequired: false,
        uncommitted: false,
        deleted: false
      };
      expect(afterDelete).to.deep.equal(expectedAfterDelete);
    }));

    it("ignores a model that isn't deleting", () => withStorage(async (adapter: IdbStorageAdapter) => {
      const modelStore = adapter.modelStore();
      const modelState = createModelState();
      await modelStore.putModelState(modelState);
      await modelStore.completeModelDeletion(modelState.modelId);
      const afterDelete = await modelStore.getModelMetaData(modelState.modelId);
      const expectedAfterDelete: IModelMetaData = {
        modelId: modelState.modelId,
        subscribed: false,
        available: true,
        created: false,
        syncRequired: false,
        uncommitted: false,
        deleted: false,
        details: {
          collection: modelState.collection,
          createdTime: modelState.createdTime,
          lastSequenceNumber: modelState.lastSequenceNumber,
          modifiedTime: modelState.modifiedTime,
          permissions: modelState.permissions,
          snapshotSequenceNumber: modelState.snapshot.sequenceNumber,
          snapshotVersion: modelState.snapshot.version,
          valueIdPrefix: {prefix: modelState.valueIdPrefix.prefix, increment: modelState.valueIdPrefix.increment!},
          version: modelState.version
        }
      };
      expect(afterDelete).to.deep.equal(expectedAfterDelete);
    }));
  });


  describe("deleteModels()", () => {
    it("delete only the models specified", () => withStorage(async (adapter: IdbStorageAdapter) => {
      const modelStore = adapter.modelStore();
      const modelState1 = createModelState();
      await modelStore.putModelState(modelState1);

      const modelState2 = createModelState();
      await modelStore.putModelState(modelState2);

      const modelState3 = createModelState();
      await modelStore.putModelState(modelState3);

      await modelStore.deleteModels([modelState1.modelId, modelState3.modelId]);
      const model1Read = await modelStore.getModelMetaData(modelState1.modelId);
      const model2Read = await modelStore.getModelMetaData(modelState2.modelId);
      const model3Read = await modelStore.getModelMetaData(modelState3.modelId);

      expect(model1Read).to.be.undefined;
      expect(model2Read).to.not.be.undefined;
      expect(model3Read).to.be.undefined;
    }));

    it("not fail on an empty array", () => withStorage(async (adapter: IdbStorageAdapter) => {
      const modelStore = adapter.modelStore();
      await modelStore.deleteModels([]);
    }));

    it("not fail on an non-existent model id", () => withStorage(async (adapter: IdbStorageAdapter) => {
      const modelStore = adapter.modelStore();
      await modelStore.deleteModels(["no-model"]);
    }));
  });

  describe("modelExists()", () => {
    it("returns false for a model that does not exist", () => withStorage(async (adapter: IdbStorageAdapter) => {
      const modelStore = adapter.modelStore();
      const exists = await modelStore.modelExists("any-id");
      expect(exists).to.be.false;
    }));

    it("returns true for a model that exists", () => withStorage(async (adapter: IdbStorageAdapter) => {
      const modelStore = adapter.modelStore();
      const modelState = createModelState();
      await modelStore.putModelState(modelState);
      const exists = await modelStore.modelExists(modelState.modelId);
      expect(exists).to.be.true;
    }));
  });

  describe("putModel()", () => {
    it("stores the correct model", () => withStorage(async (adapter: IdbStorageAdapter) => {
      const modelStore = adapter.modelStore();
      const modelState = createModelState();
      await modelStore.putModelState(modelState);
      const retrieved = await modelStore.getModelState(modelState.modelId);
      expect(retrieved).to.deep.equal(modelState);
    }));
  });

  describe("deleteModel()", () => {
    it("deletes and existing model", () => withStorage(async (adapter: IdbStorageAdapter) => {
        const modelStore = adapter.modelStore();
        const modelState = createModelState();
        await modelStore.putModelState(modelState);
        const exists = await modelStore.modelExists(modelState.modelId);
        expect(exists).to.be.true;

        await modelStore.deleteModels([modelState.modelId]);
        const afterDelete = await modelStore.modelExists(modelState.modelId);
        expect(afterDelete).to.be.false;
      })
    );
  });

  describe("updateSubscriptions()", () => {
    it("correctly adds new subscriptions", () => withStorage(async (adapter: IdbStorageAdapter) => {
        const modelStore = adapter.modelStore();
        const toSubscribe = ["model1", "model2"];
        await modelStore.updateSubscriptions(toSubscribe, []);
        const subscribed = await modelStore.getSubscribedModels();
        const expected = new Set<IModelMetaData>();

        expected.add({...DefaultMetaData, modelId: "model1"});
        expected.add({...DefaultMetaData, modelId: "model2"});

        expect(new Set(subscribed)).to.be.deep.equals(expected);
      })
    );

    it("correctly removes existing subscriptions", () => withStorage(async (adapter: IdbStorageAdapter) => {
        const modelStore = adapter.modelStore();
        const toSubscribe = ["model1", "model2"];
        await modelStore.updateSubscriptions(toSubscribe, []);
        await modelStore.updateSubscriptions([], ["model1"]);
        const subscribed = await modelStore.getSubscribedModels();

        const expectedSubscribed = new Set<IModelMetaData>();
        expectedSubscribed.add({...DefaultMetaData, modelId: "model2"});

        expect(new Set(subscribed)).to.be.deep.equals(expectedSubscribed);

        const all = await modelStore.getAllModelMetaData();

        const expectedAll = new Set<IModelMetaData>();
        expectedAll.add({...DefaultMetaData, subscribed: false, modelId: "model1"});
        expectedAll.add({...DefaultMetaData, modelId: "model2"});

        expect(new Set(all)).to.be.deep.equals(expectedAll);
      })
    );
  });

  describe("processLocalOperation()", () => {
    it("Reject if the model does not exist", () => withStorage(async (adapter) => {
        const modelStore = adapter.modelStore();
        const localOp: ILocalOperationData = {
          sequenceNumber: 0,
          contextVersion: 1,
          modelId: "does-not-exist",
          sessionId: "none",
          operation: {
            type: "string_insert",
          },
          timestamp: new Date()
        };

        const result = modelStore.processLocalOperation(localOp);
        return expect(result).to.eventually.be.rejected;
      })
    );
  });
});

let modelCounter = 1;

function createModelState(): IModelState {
  return {
    modelId: "modelId" + modelCounter++,
    collection: "collection",
    local: false,
    version: 10,
    lastSequenceNumber: 0,
    valueIdPrefix: {prefix: "vid", increment: 0},
    createdTime: new Date(),
    modifiedTime: new Date(),
    permissions: new ModelPermissions(true, true, true, true),
    snapshot: {
      version: 10,
      sequenceNumber: 0,
      data: {
        type: "object",
        id: "1:0",
        value: {}
      },
      localOperations: [],
      serverOperations: []
    }
  };
}

const DefaultMetaData = {
  created: false,
  deleted: false,
  subscribed: true,
  available: false,
  syncRequired: false,
  uncommitted: false
}
Object.freeze(DefaultMetaData);

const DefaultModelCreationData: IModelCreationData = {
  modelId: "test-model",
  collection: "test-collection",
  initialData: {
    id: "0",
    type: "object",
    value: {}
  },
  valueIdPrefix: "@",
  createdTime: new Date(),
  overrideCollectionWorldPermissions: false,
  worldPermissions: new ModelPermissions(true, true, true, true),
  userPermissions: {
    "user1": new ModelPermissions(true, true, true, true)
  }
};

Object.freeze(DefaultModelCreationData);

let counter = 1;

function withStorage(body: (IdbStorageAdapter) => Promise<any>): Promise<any> {
  const adapter = new IdbStorageAdapter();
  return adapter.initialize("namespace", "domain" + counter++, "someuser")
    .then(() => body(adapter))
    .then((result) => {
      adapter.destroy();
      return Promise.resolve(result);
    })
    .catch((e) => {
      adapter.destroy();
      return Promise.reject(e);
    });
}
