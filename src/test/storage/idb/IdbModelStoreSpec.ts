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
import {
  ILocalOperationData,
  IModelCreationData,
  IModelMetaData,
  IModelState, IModelUpdate,
  IServerOperationData
} from "../../../main/storage/api/";
import {IObjectValue, ModelPermissions} from "../../../main/model/";

import * as chai from "chai";
// tslint:disable-next-line:no-duplicate-imports
import {expect} from "chai";
import "fake-indexeddb/auto";
import * as chaiAsPromised from "chai-as-promised";
import {fail} from "assert";
import {IObjectAddPropertyOperationData} from "../../../main/storage/api/IModelOperationData";

chai.use(chaiAsPromised);

describe("IdbModelStore", () => {

  describe("initiateModelCreation()", () => {
    it("returns the correct metadata", () => withStorage(async (adapter: IdbStorageAdapter) => {
        const modelStore = adapter.modelStore();

        const created: IModelMetaData = await modelStore.initiateModelCreation(DefaultModelCreationData);
        expect(created).to.deep.equals(DefaultCreatedMetaData);

        const read: IModelMetaData = await modelStore.getModelMetaData(DefaultModelCreationData.modelId);
        expect(read).to.deep.equals(DefaultCreatedMetaData);
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
      expect(createData).to.be.null;
    }));

    it("correctly updated model meta data", () => withStorage(async (adapter: IdbStorageAdapter) => {
      const modelStore = adapter.modelStore();
      await modelStore.initiateModelCreation(DefaultModelCreationData);
      await modelStore.completeModelCreation(DefaultModelCreationData.modelId);
      const metaData = await modelStore.getModelMetaData(DefaultModelCreationData.modelId);
      const expected = {...DefaultCreatedMetaData, created: false, syncRequired: false};
      expect(metaData).to.deep.equals(expected);
    }));
  });

  describe("getModelCreationData()", () => {
    it("returns correct data for a model that does not exist", () => withStorage(async (adapter: IdbStorageAdapter) => {
      const modelStore = adapter.modelStore();
      await modelStore.initiateModelCreation(DefaultModelCreationData);
      const createData = await modelStore.getModelCreationData(DefaultModelCreationData.modelId);
      expect(createData).to.deep.equal(DefaultModelCreationData);
    }));

    it("returns null for a model not being created", () => withStorage(async (adapter) => {
      const modelStore = adapter.modelStore();
      const createData = await modelStore.getModelCreationData(DefaultModelCreationData.modelId);
      expect(createData).to.be.null;
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
      await modelStore.setModelState(modelState);
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
      await modelStore.setModelState(modelState);
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
      await modelStore.setModelState(modelState);
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
      await modelStore.setModelState(modelState1);

      const modelState2 = createModelState();
      await modelStore.setModelState(modelState2);

      const modelState3 = createModelState();
      await modelStore.setModelState(modelState3);

      await modelStore.deleteModels([modelState1.modelId, modelState3.modelId]);
      const model1Read = await modelStore.getModelMetaData(modelState1.modelId);
      const model2Read = await modelStore.getModelMetaData(modelState2.modelId);
      const model3Read = await modelStore.getModelMetaData(modelState3.modelId);

      expect(model1Read).to.be.null;
      expect(model2Read).to.not.be.null;
      expect(model3Read).to.be.null;
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

  describe("modelMetaDataExists()", () => {
    it("returns false for a model that does not exist", () => withStorage(async (adapter: IdbStorageAdapter) => {
      const modelStore = adapter.modelStore();
      const exists = await modelStore.modelMetaDataExists("any-id");
      expect(exists).to.be.false;
    }));

    it("returns true for a model that exists", () => withStorage(async (adapter: IdbStorageAdapter) => {
      const modelStore = adapter.modelStore();
      const modelState = createModelState();
      await modelStore.setModelState(modelState);
      const exists = await modelStore.modelMetaDataExists(modelState.modelId);
      expect(exists).to.be.true;
    }));
  });

  describe("getModelMetaData()", () => {
    it("returns meta-data for the correct model", () => withStorage(async (adapter: IdbStorageAdapter) => {
      const modelStore = adapter.modelStore();
      const toSubscribe = ["model1", "model2"];
      await modelStore.updateSubscriptions(toSubscribe, []);
      const retrieved = await modelStore.getModelMetaData("model2");
      const expected: IModelMetaData = {
        modelId: "model2",
        subscribed: true,
        available: false,
        syncRequired: false,
        deleted: false,
        uncommitted: false,
        created: false
      }
      expect(retrieved).to.deep.equal(expected);
    }));

    it("returns null for a model that does not exist", () => withStorage(async (adapter: IdbStorageAdapter) => {
      const modelStore = adapter.modelStore();
      const retrieved = await modelStore.getModelMetaData("");
      expect(retrieved).to.be.null;
    }));
  });

  describe("getAllModelMetaData()", () => {
    it("returns meta-data for the correct models", () => withStorage(async (adapter: IdbStorageAdapter) => {
      const modelStore = adapter.modelStore();
      const toSubscribe = ["model1", "model2"];
      await modelStore.updateSubscriptions(toSubscribe, []);
      const retrieved = await modelStore.getAllModelMetaData();
      const expected: IModelMetaData[] = [
        {...DefaultMetaData, subscribed: true, modelId: "model1"},
        {...DefaultMetaData, subscribed: true, modelId: "model2"}
      ];
      expect(new Set(retrieved)).to.deep.equal(new Set(expected));
    }));

    it("returns an empty array if no models exist", () => withStorage(async (adapter: IdbStorageAdapter) => {
      const modelStore = adapter.modelStore();
      const retrieved = await modelStore.getAllModelMetaData();
      expect(retrieved).to.deep.equal([]);
    }));
  });

  describe("getSubscribedModels()", () => {
    it("returns meta-data for the correct model", () => withStorage(async (adapter: IdbStorageAdapter) => {
      const modelStore = adapter.modelStore();
      // Not subscribed
      const modelState = createModelState();
      await modelStore.setModelState(modelState);

      const toSubscribe = ["model1", "model2"];
      await modelStore.updateSubscriptions(toSubscribe, []);
      const all = await modelStore.getAllModelMetaData();

      expect(all.length).to.equal(3);

      const retrieved = await modelStore.getSubscribedModels();
      const expected: IModelMetaData[] = [
        {...DefaultMetaData, subscribed: true, modelId: "model1"},
        {...DefaultMetaData, subscribed: true, modelId: "model2"}
      ];
      expect(new Set(retrieved)).to.deep.equal(new Set(expected));
    }));

    it("returns an empty array if no models are subscribed", () => withStorage(async (adapter: IdbStorageAdapter) => {
      const modelStore = adapter.modelStore();
      const modelState = createModelState();
      await modelStore.setModelState(modelState);
      const retrieved = await modelStore.getSubscribedModels();
      expect(retrieved).to.deep.equal([]);
    }));
  });

  describe("getModelsRequiringSync()", () => {
    it("returns meta-data for the correct model", () => withStorage(async (adapter: IdbStorageAdapter) => {
      const modelStore = adapter.modelStore();
      // Not subscribed
      const modelState = createModelState();
      await modelStore.setModelState(modelState);

      await modelStore.initiateModelCreation(DefaultModelCreationData);

      const all = await modelStore.getAllModelMetaData();
      expect(all.length).to.equal(2);

      const retrieved = await modelStore.getModelsRequiringSync();
      expect(retrieved.length).to.equal(1);
      expect(retrieved[0]).to.deep.equal(DefaultCreatedMetaData);
    }));

    it("returns an empty array if no models are subscribed", () => withStorage(async (adapter: IdbStorageAdapter) => {
      const modelStore = adapter.modelStore();
      const modelState = createModelState();
      await modelStore.setModelState(modelState);
      const retrieved = await modelStore.getModelsRequiringSync();
      expect(retrieved).to.deep.equal([]);
    }));
  });

  describe("setModelState()", () => {
    it("stores the correct data for a new model", () => withStorage(async (adapter: IdbStorageAdapter) => {
      const modelStore = adapter.modelStore();
      const modelState = createModelState();
      await modelStore.setModelState(modelState);
      const retrievedState = await modelStore.getModelState(modelState.modelId);
      expect(retrievedState).to.deep.equal(modelState);

      const metaData = await modelStore.getModelMetaData(modelState.modelId);
      expect(metaData.uncommitted).to.be.false;
      expect(metaData.subscribed).to.be.false;
      expect(metaData.syncRequired).to.be.false;
      expect(metaData.deleted).to.be.false;
      expect(metaData.created).to.be.false;
      expect(metaData.available).to.be.true;
    }));

    it("sets created flag properly", () => withStorage(async (adapter: IdbStorageAdapter) => {
      const modelStore = adapter.modelStore();
      const modelState = createModelState();
      modelState.local = true;
      await modelStore.setModelState(modelState);
      const metaData = await modelStore.getModelMetaData(modelState.modelId);
      expect(metaData.created).to.be.true;
    }));

    it("sets uncommitted if local ops are in snapshot", () => withStorage(async (adapter: IdbStorageAdapter) => {
      const modelStore = adapter.modelStore();
      const modelState = createModelState();
      modelState.snapshot.localOperations.push(createLocalOp(modelState));
      await modelStore.setModelState(modelState);
      const metaData = await modelStore.getModelMetaData(modelState.modelId);
      expect(metaData.uncommitted).to.be.true;
    }));

    it("properly merges with existing subscribed model", () => withStorage(async (adapter: IdbStorageAdapter) => {
      const modelStore = adapter.modelStore();
      const modelState = createModelState();
      await modelStore.updateSubscriptions([modelState.modelId], []);
      await modelStore.setModelState(modelState);
      const metaData = await modelStore.getModelMetaData(modelState.modelId);
      expect(metaData.subscribed).to.be.true;
    }));
  });

  describe("getModelState()", () => {
    it("returns null for a model that does not exist", () => withStorage(async (adapter: IdbStorageAdapter) => {
      const modelStore = adapter.modelStore();
      const retrieved = await modelStore.getModelState("");
      expect(retrieved).to.be.null;
    }));

    it("returns null for a model that does have data", () => withStorage(async (adapter: IdbStorageAdapter) => {
      const modelStore = adapter.modelStore();
      const toSubscribe = ["model1"];
      await modelStore.updateSubscriptions(toSubscribe, []);
      const retrieved = await modelStore.getModelState("model1");
      expect(retrieved).to.be.null;
    }));
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
    }));

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
    }));

    it("correctly ignores removing a subscription for a model that is not subscribed", () => withStorage(async (adapter: IdbStorageAdapter) => {
      const modelStore = adapter.modelStore();
      await modelStore.updateSubscriptions([], ["notsubscribed"]);
      await modelStore.getSubscribedModels();
    }));
  });

  describe("processServerOperation()", () => {
    it("Reject if serverOp is not set", () => withStorage(async (adapter: IdbStorageAdapter) => {
      const modelStore = adapter.modelStore();
      const result = modelStore.processServerOperation(undefined, []);
      return expect(result).to.eventually.be.rejected;
    }));

    it("Reject if localOps is not set", () => withStorage(async (adapter: IdbStorageAdapter) => {
      const modelStore = adapter.modelStore();
      const result = modelStore.processServerOperation({} as IServerOperationData, undefined);
      return expect(result).to.eventually.be.rejected;
    }));

    it("Reject if localOps has a non-matching modelId", () => withStorage(async (adapter: IdbStorageAdapter) => {
      const modelStore = adapter.modelStore();
      const modelState = createModelState();
      const serverOp = createServerOp(modelState);
      const localOp = createLocalOp(modelState);
      localOp.contextVersion = serverOp.version;
      localOp.modelId = "not right";
      const result = modelStore.processServerOperation(serverOp, [localOp]);
      return expect(result).to.eventually.be.rejected;
    }));

    it("reject if the model is not found", () => withStorage(async (adapter: IdbStorageAdapter) => {
      const modelStore = adapter.modelStore();
      const modelState = createModelState();
      const serverOp = createServerOp(modelState);
      const result = modelStore.processServerOperation(serverOp, []);
      return expect(result).to.eventually.be.rejected;
    }));

    it("process valid server op correctly", () => withStorage(async (adapter: IdbStorageAdapter) => {
      const modelStore = adapter.modelStore();
      const modelState = createModelState();
      await modelStore.setModelState(modelState);
      const serverOp = createServerOp(modelState);
      const localOp = createLocalOp(modelState);

      await modelStore.processLocalOperation(localOp);

      // simulates a transformation
      localOp.contextVersion = serverOp.version;

      await modelStore.processServerOperation(serverOp, [localOp]);

      const read = await modelStore.getModelState(modelState.modelId);
      expect(read.modelId).to.equal(modelState.modelId);
      expect(read.collection).to.equal(modelState.collection);
      expect(read.version).to.equal(serverOp.version + 1);
      expect(read.local).to.equal(modelState.local);
      expect(read.lastSequenceNumber).to.equal(localOp.sequenceNumber);

      expect(read.snapshot.version).to.equal(modelState.snapshot.version);
      expect(read.snapshot.sequenceNumber).to.equal(modelState.snapshot.sequenceNumber);
      expect(read.snapshot.data).to.deep.equal(modelState.snapshot.data);

      expect(read.snapshot.localOperations.length).to.equal(1);
      const readServerOp = read.snapshot.serverOperations[0];
      expect(readServerOp).to.deep.equal(serverOp);

      expect(read.snapshot.localOperations.length).to.equal(1);
      const readLocalOp = read.snapshot.localOperations[0];
      expect(readLocalOp).to.deep.equal(localOp);

      const afterMetaData = await modelStore.getModelMetaData(modelState.modelId);
      expect(afterMetaData.uncommitted).to.be.true;
    }));
  });

  describe("processLocalOperation()", () => {
    it("Reject if localOp is not set", () => withStorage(async (adapter: IdbStorageAdapter) => {
      const modelStore = adapter.modelStore();
      const result = modelStore.processLocalOperation(undefined);
      return expect(result).to.eventually.be.rejected;
    }));

    it("Reject if the model does not exist", () => withStorage(async (adapter: IdbStorageAdapter) => {
      const modelStore = adapter.modelStore();
      const modelState = createModelState();
      const localOp = createLocalOp(modelState);
      const result = modelStore.processLocalOperation(localOp);
      return expect(result).to.eventually.be.rejected;
    }));

    it("properly process operation", () => withStorage(async (adapter: IdbStorageAdapter) => {
      const modelStore = adapter.modelStore();
      const modelState = createModelState();
      await modelStore.setModelState(modelState);
      const initialMetaData = await modelStore.getModelMetaData(modelState.modelId);
      expect(initialMetaData.uncommitted).to.be.false;
      expect(initialMetaData.syncRequired).to.be.false;

      const localOp: ILocalOperationData = createLocalOp(modelState);

      await modelStore.processLocalOperation(localOp);

      const read = await modelStore.getModelState(modelState.modelId);
      expect(read.modelId).to.equal(modelState.modelId);
      expect(read.collection).to.equal(modelState.collection);
      expect(read.version).to.equal(modelState.version);
      expect(read.local).to.equal(modelState.local);
      expect(read.lastSequenceNumber).to.equal(localOp.sequenceNumber);

      expect(read.snapshot.version).to.equal(modelState.snapshot.version);
      expect(read.snapshot.sequenceNumber).to.equal(modelState.snapshot.sequenceNumber);
      expect(read.snapshot.data).to.deep.equal(modelState.snapshot.data);
      expect(read.snapshot.serverOperations.length).to.equal(0);

      expect(read.snapshot.localOperations.length).to.equal(1);
      const readOp = read.snapshot.localOperations[0];
      expect(readOp).to.deep.equal(localOp);

      const afterMetaData = await modelStore.getModelMetaData(modelState.modelId);
      expect(afterMetaData.uncommitted).to.be.true;
      expect(afterMetaData.syncRequired).to.be.true;
    }));
  });

  describe("processOperationAck()", () => {
    it("Reject if the related model is undefined", () => withStorage(async (adapter: IdbStorageAdapter) => {
      const modelStore = adapter.modelStore();
      const result = modelStore.processOperationAck("doesNotExist", 0, undefined);
      return expect(result).to.eventually.be.rejected;
    }));

    it("properly process operation", () => withStorage(async (adapter: IdbStorageAdapter) => {
      const modelStore = adapter.modelStore();
      const modelState = createModelState();
      await modelStore.setModelState(modelState);
      const localOp: ILocalOperationData = createLocalOp(modelState);
      await modelStore.processLocalOperation(localOp);

      const initialMetaData = await modelStore.getModelMetaData(modelState.modelId);
      expect(initialMetaData.uncommitted).to.be.true;
      expect(initialMetaData.syncRequired).to.be.true;

      const serverOp: IServerOperationData = {
        modelId: modelState.modelId,
        version: modelState.version,
        timestamp: new Date(),
        sessionId: "session",
        operation: localOp.operation
      }
      await modelStore.processOperationAck(modelState.modelId, localOp.sequenceNumber, serverOp);

      const read = await modelStore.getModelState(modelState.modelId);
      expect(read.modelId).to.equal(modelState.modelId);
      expect(read.collection).to.equal(modelState.collection);
      expect(read.version).to.equal(modelState.version + 1);
      expect(read.local).to.equal(modelState.local);
      expect(read.lastSequenceNumber).to.equal(localOp.sequenceNumber);

      expect(read.snapshot.version).to.equal(modelState.snapshot.version);
      expect(read.snapshot.sequenceNumber).to.equal(modelState.snapshot.sequenceNumber);
      expect(read.snapshot.data).to.deep.equal(modelState.snapshot.data);
      expect(read.snapshot.serverOperations.length).to.equal(1);
      expect(read.snapshot.serverOperations[0]).to.deep.equal(serverOp);
      expect(read.snapshot.localOperations.length).to.equal(0);

      const afterMetaData = await modelStore.getModelMetaData(modelState.modelId);
      expect(afterMetaData.uncommitted).to.be.false;
      expect(afterMetaData.syncRequired).to.be.false;
    }));
  });

  describe("snapshotModel()", () => {
    it("reject if the model does not exist", () => withStorage(async (adapter: IdbStorageAdapter) => {
      const modelStore = adapter.modelStore();
      const result = modelStore.snapshotModel("does-not-exist", 0, 3, DefaultModelData);
      return expect(result).to.eventually.be.rejected;
    }));

    it("reject if the modelData is undefined", () => withStorage(async (adapter: IdbStorageAdapter) => {
      const modelStore = adapter.modelStore();
      const result = modelStore.snapshotModel("does-not-exist", 0, 3, undefined);
      return expect(result).to.eventually.be.rejected;
    }));

    it("properly snapshot the model", () => withStorage(async (adapter: IdbStorageAdapter) => {
      // We set up a model that has both a server operation and a local
      // operation so we can observe how the snapshot process affects
      // both.

      const modelStore = adapter.modelStore();
      const modelState = createModelState();
      await modelStore.setModelState(modelState);
      const serverOp = createServerOp(modelState);
      const localOp = createLocalOp(modelState);
      await modelStore.processLocalOperation(localOp);
      localOp.contextVersion = serverOp.version;
      await modelStore.processServerOperation(serverOp, [localOp]);

      const beforeSnapshot = await modelStore.getModelState(modelState.modelId);
      await modelStore.snapshotModel(modelState.modelId, beforeSnapshot.version, localOp.sequenceNumber, DefaultModelData);
      const afterSnapshot = await modelStore.getModelState(modelState.modelId);

      expect(afterSnapshot.modelId).to.equal(beforeSnapshot.modelId);
      expect(afterSnapshot.collection).to.equal(beforeSnapshot.collection);
      expect(afterSnapshot.version).to.equal(beforeSnapshot.version);
      expect(afterSnapshot.local).to.equal(beforeSnapshot.local);
      expect(afterSnapshot.lastSequenceNumber).to.equal(localOp.sequenceNumber);

      expect(afterSnapshot.snapshot.version).to.equal(beforeSnapshot.version);
      expect(afterSnapshot.snapshot.sequenceNumber).to.equal(localOp.sequenceNumber);
      expect(afterSnapshot.snapshot.data).to.deep.equal(DefaultModelData);
      expect(afterSnapshot.snapshot.serverOperations.length).to.equal(0);
      expect(afterSnapshot.snapshot.localOperations.length).to.equal(1);
      expect(afterSnapshot.snapshot.localOperations[0]).to.deep.equal(localOp);
    }));
  });

  describe("claimValueIdPrefix()", () => {
    it("Reject if the related model is undefined", () => withStorage(async (adapter: IdbStorageAdapter) => {
      const modelStore = adapter.modelStore();
      const result = modelStore.claimValueIdPrefix("not-such-model");
      return expect(result).to.eventually.be.rejected;
    }));

    it("return the correct prefix", () => withStorage(async (adapter: IdbStorageAdapter) => {
      const modelStore = adapter.modelStore();
      const modelState = createModelState();
      await modelStore.setModelState(modelState);
      const prefix = await modelStore.claimValueIdPrefix(modelState.modelId);

      const expected = {prefix: modelState.valueIdPrefix.prefix, increment: modelState.valueIdPrefix.increment};
      expect(prefix).to.deep.equal(expected);
    }));

    it("increment the prefix when gotten", () => withStorage(async (adapter: IdbStorageAdapter) => {
      const modelStore = adapter.modelStore();
      const modelState = createModelState();
      await modelStore.setModelState(modelState);
      await modelStore.claimValueIdPrefix(modelState.modelId);

      const afterClaim = await modelStore.getModelState(modelState.modelId);
      expect(afterClaim.valueIdPrefix.prefix).to.deep.equal(modelState.valueIdPrefix.prefix);
      expect(afterClaim.valueIdPrefix.increment).to.deep.equal(modelState.valueIdPrefix.increment + 1);
    }));
  });

  describe("processOfflineModelUpdate()", () => {
    it("ignore if the related model is undefined", () => withStorage(async (adapter: IdbStorageAdapter) => {
      const modelStore = adapter.modelStore();
      const update = createOfflineUpdate("no-model");
      await modelStore.processOfflineModelUpdate(update);
    }));

    it("reject if model is uncommitted", () => withStorage(async (adapter: IdbStorageAdapter) => {
      const modelStore = adapter.modelStore();
      const modelState = createModelState();
      modelState.snapshot.localOperations.push(createLocalOp(modelState));
      await modelStore.setModelState(modelState);
      const meta = await modelStore.getModelMetaData(modelState.modelId);
      expect(meta.uncommitted).to.be.true;

      const update = createOfflineUpdate(modelState.modelId);
      const result = modelStore.processOfflineModelUpdate(update);

      expect(result).to.eventually.be.rejected
    }));

    it("properly updated data and permissions", () => withStorage(async (adapter: IdbStorageAdapter) => {
      const modelStore = adapter.modelStore();
      const modelState = createModelState();
      await modelStore.setModelState(modelState);
      // make sure we have a server op, so that we know that
      // the update will get rid of it.
      await modelStore.processServerOperation(createServerOp(modelState), []);
      const update = createOfflineUpdate(modelState.modelId);
      await modelStore.processOfflineModelUpdate(update);

      const stateAfterUpdate = await modelStore.getModelState(modelState.modelId);

      expect(stateAfterUpdate.version).to.equal(update.dataUpdate.version);
      expect(stateAfterUpdate.createdTime).to.deep.equal(update.dataUpdate.createdTime);
      expect(stateAfterUpdate.modifiedTime).to.deep.equal(update.dataUpdate.modifiedTime);

      expect(stateAfterUpdate.snapshot.version).to.deep.equal(update.dataUpdate.version);
      expect(stateAfterUpdate.snapshot.sequenceNumber).to.deep.equal(stateAfterUpdate.lastSequenceNumber);

      expect(stateAfterUpdate.snapshot.data).to.deep.equal(update.dataUpdate.data);

      expect(stateAfterUpdate.permissions).to.deep.equal(update.permissionsUpdate);

      expect(stateAfterUpdate.snapshot.serverOperations.length).to.equal(0);
    }));
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

function createOfflineUpdate(modelId: string): IModelUpdate {
  return {
    modelId,
    dataUpdate: {
      version: 12,
      createdTime: new Date(),
      modifiedTime: new Date(),
      data: DefaultModelData
    },
    permissionsUpdate: new ModelPermissions(false, true, false, true)
  }
}

const DefaultCreatedMetaData: IModelMetaData = {
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

Object.freeze(DefaultModelCreationData);

function createLocalOp(modelState: IModelState): ILocalOperationData {
  return {
    sequenceNumber: modelState.lastSequenceNumber + 1,
    contextVersion: modelState.version,
    modelId: modelState.modelId,
    sessionId: "none",
    operation: {
      id: modelState.snapshot.data.id,
      noOp: false,
      type: "object_add_property",
      key: "local-key",
      value: {type: "string", id: "1:1", value: "test"}
    } as IObjectAddPropertyOperationData,
    timestamp: new Date()
  };
}

function createServerOp(modelState: IModelState): IServerOperationData {
  return {
    version: modelState.version + 1,
    modelId: modelState.modelId,
    sessionId: "none",
    operation: {
      id: modelState.snapshot.data.id,
      noOp: false,
      type: "object_add_property",
      key: "server-key",
      value: {type: "string", id: "1:1", value: "test"}
    } as IObjectAddPropertyOperationData,
    timestamp: new Date()
  };
}

const DefaultModelData: IObjectValue = {
  id: "0",
  type: "object",
  value: {
    key: {type: "string", id: "1", value: "a val"}
  }
}

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
