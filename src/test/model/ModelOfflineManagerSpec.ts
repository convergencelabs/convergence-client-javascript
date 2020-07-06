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

import * as chai from "chai";
import "fake-indexeddb/auto";
import * as chaiAsPromised from "chai-as-promised";
import {ModelOfflineManager} from "../../main/model/ModelOfflineManager";
import {IMockConnection, mockConvergenceConnection} from "../MockConvergenceConnection";
import {LOCAL_SESSION_ID, LOCAL_USER, RECONNECT_TOKEN} from "../MockingConstants";
import {mockStorageEngine} from "../MockStorageEngine";

chai.use(chaiAsPromised);
const expect = chai.expect

describe("ModelOfflineManager", () => {

  describe("init()", () => {
    it("initialize when no models are in the store", async () => {
      const connection = mockConnection();
      const storage = mockStorageEngine();
      storage.modelStoreStub.getAllModelMetaData.returns(Promise.resolve([]));

      const offlineManager = new ModelOfflineManager(connection.connection, 10, storage.engine);
      await offlineManager.init();
    });
  });

  describe("ready()", () => {
    it("become ready after initialization", async () => {
      const connection = mockConnection();
      const storage = mockStorageEngine();
      storage.modelStoreStub.getAllModelMetaData.returns(Promise.resolve([]));

      const offlineManager = new ModelOfflineManager(connection.connection, 10, storage.engine);
      await offlineManager.init();
      await offlineManager.ready();
    });

    it("fail ready after initialization failure", async () => {
      const connection = mockConnection();
      const storage = mockStorageEngine();
      storage.modelStoreStub.getAllModelMetaData.returns(Promise.reject(new Error("testing error")));

      const offlineManager = new ModelOfflineManager(connection.connection, 10, storage.engine);
      try {
        await offlineManager.init();
      } catch (e) {
        // ignore.
      }

      expect(offlineManager.ready()).to.eventually.be.rejected;
    });
  });
});

function mockConnection(): IMockConnection {
  return mockConvergenceConnection(LOCAL_USER, LOCAL_SESSION_ID, RECONNECT_TOKEN);
}

