/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {expect} from "chai";
import "fake-indexeddb/auto";
import {IdbStorageAdapter} from "../../../main/storage/idb";

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

  describe("openStore()", () => {
    it("throws if namespace is not defined", () => {
      const adapter = new IdbStorageAdapter();
      expect(() => adapter.openStore("", "domainId", "username")).to.throw();
    });

    it("throws if domainId is not defined", () => {
      const adapter = new IdbStorageAdapter();
      expect(() => adapter.openStore("namespace", "", "username")).to.throw();
    });

    it("isInitialized() returns true after init() called", async () => {
      const adapter = new IdbStorageAdapter();
      await adapter.openStore("namespace", "domainId", "username");
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
      await adapter.openStore("namespace", "domainId", "username");
      adapter.dispose();
      expect(() => adapter.dispose()).to.throw;
    });

    it("does not throw if initialized()", async () => {
      const adapter = new IdbStorageAdapter();
      await adapter.openStore("namespace", "domainId", "username");
      adapter.dispose();
    });

    it("isDisposed() returns true after dispose() called", async () => {
      const adapter = new IdbStorageAdapter();
      await adapter.openStore("namespace", "domainId", "username");
      adapter.dispose();
      expect(adapter.isDisposed()).to.be.true;
    });

    it("isInitialized() returns false after dispose() called", async () => {
      const adapter = new IdbStorageAdapter();
      await adapter.openStore("namespace", "domainId", "username");
      adapter.dispose();
      expect(adapter.isInitialized()).to.be.false;
    });
  });
});
