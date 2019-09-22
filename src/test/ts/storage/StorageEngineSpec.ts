import {expect} from "chai";
import {StorageEngine} from "../../../main/ts/storage/StorageEngine";
import {IdbStorageAdapter} from "../../../main/ts/storage/idb/IdbStorageAdapter";
import "fake-indexeddb/auto";

describe("StorageEngine", () => {
  describe("when constructed", () => {
    it("isEnabled() returns false", () => {
      const engine = new StorageEngine();
      expect(engine.isEnabled()).to.be.false;
    });

    it("isInitialized() returns false", () => {
      const engine = new StorageEngine();
      expect(engine.isInitialized()).to.be.false;
    });
  });

  describe("configure()", () => {
    it("throws if storage is not defined", () => {
      const engine = new StorageEngine();
      expect(() => engine.configure(undefined, "namespace", "domainId")).to.throw();
    });

    it("throws if namespace is not defined", () => {
      const engine = new StorageEngine();
      const adapter = new IdbStorageAdapter();
      expect(() => engine.configure(adapter, undefined, "domainId")).to.throw();
    });

    it("throws if namespace is not defined", () => {
      const engine = new StorageEngine();
      const adapter = new IdbStorageAdapter();
      expect(() => engine.configure(adapter, "namespace", undefined)).to.throw();
    });

    it("isEnabled() returns true after configuration", () => {
      const engine = new StorageEngine();
      const adapter = new IdbStorageAdapter();
      engine.configure(adapter, "namespace", "domainId");
      expect(engine.isEnabled()).to.be.true;
    });

    it("isInitialized() returns true after configuration", async () => {
      const engine = new StorageEngine();
      const adapter = new IdbStorageAdapter();
      await engine.configure(adapter, "namespace", "domainId");
      expect(engine.isInitialized()).to.be.true;
    });
  });

  describe("dispose()", () => {
    it("throws if not initialized", () => {
      const engine = new IdbStorageAdapter();
      expect(() => engine.dispose()).to.throw();
    });

    it("throws if already disposed", async() => {
      const engine = new StorageEngine();
      const adapter = new IdbStorageAdapter();
      await engine.configure(adapter, "namespace", "domainId");
      engine.dispose();
      expect(() => engine.dispose()).to.throw;
    });

    it("does not throw if initialized()", async () => {
      const engine = new StorageEngine();
      const adapter = new IdbStorageAdapter();
      await engine.configure(adapter, "namespace", "domainId");
      engine.dispose();
    });

    it("isDisposed() returns true after dispose() called", async () => {
      const engine = new StorageEngine();
      const adapter = new IdbStorageAdapter();
      await engine.configure(adapter, "namespace", "domainId");
      engine.dispose();
      expect(engine.isDisposed()).to.be.true;
    });

    it("isInitialized() returns false after dispose() called", async () => {
      const engine = new StorageEngine();
      const adapter = new IdbStorageAdapter();
      await engine.configure(adapter, "namespace", "domainId");
      engine.dispose();
      expect(engine.isInitialized()).to.be.false;
    });
  });
});
