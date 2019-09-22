import {IdbStorageAdapter} from "../../../../main/ts/storage/idb/IdbStorageAdapter";
import {IModelState} from "../../../../main/ts/storage/api/IModelState";

import {expect} from "chai";
import "fake-indexeddb/auto";

describe("IdbModelStore", () => {
  describe("modelExists()", () => {
    it("returns false for a model that does not exist", () => withStorage(async (adapter) => {
        const modelStore = adapter.modelStore();
        const exists = await modelStore.modelExists(modelState.model.id);
        expect(exists).to.be.false;
      })
    );

    it("returns true for a model that does not exist", () => withStorage(async (adapter) => {
        const modelStore = adapter.modelStore();
        await modelStore.putModel(modelState);
        const exists = await modelStore.modelExists(modelState.model.id);
        expect(exists).to.be.true;
      })
    );
  });

  describe("putModel()", () => {
    it("stores the correct model", () => withStorage(async (adapter) => {
        const modelStore = adapter.modelStore();
        await modelStore.putModel(modelState);
        const retrieved = await modelStore.getModel(modelState.model.id);
        expect(retrieved).to.deep.equal(modelState);
      })
    );
  });
});

const modelState: IModelState = {
  model: {
    id: "modelId",
    collection: "collection",
    version: 10,
    createdTime: 5,
    modifiedTime: 6,
    data: {
      type: "object",
      id: "1:0",
      children: {}
    }
  },
  localOperations: []
};
let counter = 1;

function withStorage(body: (IdbStorageAdapter) => Promise<any>): Promise<any> {
  const adapter = new IdbStorageAdapter();
  return adapter.init("namespace", "domain" + counter++)
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