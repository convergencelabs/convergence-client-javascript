import {IdbStorageAdapter} from "../../../../main/ts/storage/idb/";
import {IModelState} from "../../../../main/ts/storage/api/IModelState";

import {expect} from "chai";
import "fake-indexeddb/auto";

describe("IdbModelStore", () => {
  describe("modelExists()", () => {
    it("returns false for a model that does not exist", () => withStorage(async (adapter) => {
        const modelStore = adapter.modelStore();
        const modelState = createModelState();
        const exists = await modelStore.modelExists(modelState.model.modelId);
        expect(exists).to.be.false;
      })
    );

    it("returns true for a model that does not exist", () => withStorage(async (adapter) => {
        const modelStore = adapter.modelStore();
        const modelState = createModelState();
        await modelStore.putModelState(modelState);
        const exists = await modelStore.modelExists(modelState.model.modelId);
        expect(exists).to.be.true;
      })
    );
  });

  describe("putModel()", () => {
    it("stores the correct model", () => withStorage(async (adapter) => {
        const modelStore = adapter.modelStore();
        const modelState = createModelState();
        await modelStore.putModelState(modelState);
        const retrieved = await modelStore.getModel(modelState.model.modelId);
        expect(retrieved).to.deep.equal(modelState);
      })
    );
  });

  describe("deleteModel()", () => {
    it("deletes and existing model ", () => withStorage(async (adapter) => {
        const modelStore = adapter.modelStore();
        const modelState = createModelState();
        await modelStore.putModelState(modelState);
        const exists = await modelStore.modelExists(modelState.model.modelId);
        expect(exists).to.be.true;

        await modelStore.deleteModel(modelState.model.modelId);
        const afterDelete = await modelStore.modelExists(modelState.model.modelId);
        expect(afterDelete).to.be.false;
      })
    );
  });
});

let modelCounter = 1;

function createModelState(): IModelState {
  return {
    model: {
      modelId: "modelId" + modelCounter++,
      collection: "collection",
      local: false,
      version: 10,
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
