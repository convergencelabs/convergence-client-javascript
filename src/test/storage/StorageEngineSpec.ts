/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3 
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "LICENSE" and
 * "COPYING.LESSER" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3 
 * and LGPLv3 licenses, if they were not provided.
 */

import {expect} from "chai";
import {StorageEngine} from "../../main/storage/StorageEngine";
import {IdbStorageAdapter} from "../../main/storage/idb";
import "fake-indexeddb/auto";

describe("StorageEngine", () => {
  describe("constructor()", () => {
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
      expect(() => engine.configure(undefined)).to.throw();
    });

    it("isEnabled() returns true after configuration", () => {
      const engine = new StorageEngine();
      const adapter = new IdbStorageAdapter();
      engine.configure(adapter);
      expect(engine.isEnabled()).to.be.true;
    });

    it("isInitialized() returns true after configuration", async () => {
      const engine = new StorageEngine();
      const adapter = new IdbStorageAdapter();
      await engine.configure(adapter);
      await engine.openStore("namespace", "domain", "username");
      expect(engine.isInitialized()).to.be.true;
    });
  });

  describe("dispose()", () => {
    it("throws if not initialized", () => {
      const engine = new IdbStorageAdapter();
      expect(() => engine.dispose()).to.throw();
    });

    it("throws if already disposed", async () => {
      const engine = new StorageEngine();
      const adapter = new IdbStorageAdapter();
      await engine.configure(adapter);
      await engine.openStore("namespace", "domain", "username");
      engine.dispose();
      expect(() => engine.dispose()).to.throw;
    });

    it("does not throw if initialized()", async () => {
      const engine = new StorageEngine();
      const adapter = new IdbStorageAdapter();
      await engine.configure(adapter);
      await engine.openStore("namespace", "domain", "username");
      engine.dispose();
    });

    it("isDisposed() returns true after dispose() called", async () => {
      const engine = new StorageEngine();
      const adapter = new IdbStorageAdapter();
      await engine.configure(adapter);
      await engine.openStore("namespace", "domain", "username");
      engine.dispose();
      expect(engine.isDisposed()).to.be.true;
    });

    it("isInitialized() returns false after dispose() called", async () => {
      const engine = new StorageEngine();
      const adapter = new IdbStorageAdapter();
      await engine.configure(adapter);
      await engine.openStore("namespace", "domain", "username");
      engine.dispose();
      expect(engine.isInitialized()).to.be.false;
    });
  });
});
