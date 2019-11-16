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
