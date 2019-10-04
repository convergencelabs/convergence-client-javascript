import {expect} from "chai";
import "fake-indexeddb/auto";
import {IdbStorageAdapter} from "../../../../main/ts/storage/idb/IdbStorageAdapter";

describe("IdbStorageAdapter", () => {
  describe("when constructed", () => {
    it("isDisposed() returns false", () => {
      const adapter = new IdbStorageAdapter();
      expect(adapter.isDisposed()).to.be.false;
    });

    it("isInitialized() returns false", () => {
      const adapter = new IdbStorageAdapter();
      expect(adapter.isInitialized()).to.be.false;
    });
  });

  describe("init()", () => {
    it("throws if namespace is not defined", () => {
      const adapter = new IdbStorageAdapter();
      expect(() => adapter.init("", "domainId")).to.throw();
    });

    it("throws if domainId is not defined", () => {
      const adapter = new IdbStorageAdapter();
      expect(() => adapter.init("namespace", "")).to.throw();
    });

    it("isInitialized() returns true after init() called", async () => {
      const adapter = new IdbStorageAdapter();
      await adapter.init("namespace", "domainId");
      expect(adapter.isInitialized()).to.be.true;
    });
  });

  describe("dispose()", () => {
    it("throws if not initialized", () => {
      const adapter = new IdbStorageAdapter();
      expect(() => adapter.dispose()).to.throw();
    });

    it("throws if already disposed", async () => {
      const adapter = new IdbStorageAdapter();
      await adapter.init("namespace", "domainId");
      adapter.dispose();
      expect(() => adapter.dispose()).to.throw;
    });

    it("does not throw if initialized()", async () => {
      const adapter = new IdbStorageAdapter();
      await adapter.init("namespace", "domainId");
      adapter.dispose();
    });

    it("isDisposed() returns true after dispose() called", async () => {
      const adapter = new IdbStorageAdapter();
      await adapter.init("namespace", "domainId");
      adapter.dispose();
      expect(adapter.isDisposed()).to.be.true;
    });

    it("isInitialized() returns false after dispose() called", async () => {
      const adapter = new IdbStorageAdapter();
      await adapter.init("namespace", "domainId");
      adapter.dispose();
      expect(adapter.isInitialized()).to.be.false;
    });
  });
});
