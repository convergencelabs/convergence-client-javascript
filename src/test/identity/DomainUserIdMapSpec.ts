/*
 * Copyright (c) 2021 - Convergence Labs, Inc.
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

import {DomainUserId, DomainUserIdMap} from "../../main";

import {expect} from "chai";

const normal1 = DomainUserId.normal("user1");
const normal2 = DomainUserId.normal("user2");
const convergence1 = DomainUserId.convergence("user1");
const anonymous2 = DomainUserId.convergence("user2");

describe("DomainUserIdMap", () => {

  describe("constructor", () => {
    it("Properly constructs an empty map", () => {
      const map = new DomainUserIdMap();
      expect(map.size()).to.equal(0);
      expect(map.keys().length).to.equal(0);
    });
  });

  describe("getting and setting", () => {
    it("Getting a non-set key returns undefined", () => {
      const map = new DomainUserIdMap();
      expect(map.get(normal1)).to.be.undefined;
    });

    it("Can get a set value", () => {
      const map = new DomainUserIdMap();
      map.set(normal1, 5);
      expect(map.get(normal1)).to.equal(5);
    });

    it("Setting different keys sets different values", () => {
      const map = new DomainUserIdMap();
      map.set(normal1, 5);
      map.set(normal2, 10);
      expect(map.get(normal1)).to.equal(5);
      expect(map.get(normal2)).to.equal(10);
    });
  });

  describe("has", () => {
    it("Returns trues for a set value", () => {
      const map = new DomainUserIdMap();
      expect(map.has(normal1)).to.be.false;
    });

    it("Can get a set value", () => {
      const map = new DomainUserIdMap();
      map.set(normal1, 5);
      expect(map.has(normal1)).to.be.true;
      expect(map.has(normal2)).to.be.false;
    });
  });

  describe("size", () => {
    it("Returns number of set values", () => {
      const map = new DomainUserIdMap();
      map.set(normal1, 5);
      map.set(normal1, 6);
      map.set(normal2, 7);
      expect(map.size()).to.equal(2);
    });
  });

  describe("delete", () => {
    it("Deletes a set value", () => {
      const map = new DomainUserIdMap();
      map.set(normal1, 5);
      map.set(normal2, 7);
      map.delete(normal1);
      expect(map.size()).to.equal(1);
      expect(map.has(normal1)).to.be.false;
      expect(map.has(normal2)).to.be.true;
    });
  });

  describe("keys", () => {
    it("Return the correct keys", () => {
      const map = new DomainUserIdMap();
      map.set(normal1, 1);
      map.set(normal2, 2);
      map.set(convergence1, 3);
      map.set(anonymous2, 4);
      const keys = map.keys();
      expect(keys.length).to.equal(4);
      expect(keys.find(v => v.equals(normal1))).to.not.be.undefined
      expect(keys.find(v => v.equals(normal2))).to.not.be.undefined
      expect(keys.find(v => v.equals(convergence1))).to.not.be.undefined
      expect(keys.find(v => v.equals(anonymous2))).to.not.be.undefined
    });
  });

  describe("entries", () => {
    it("Return the correct entries", () => {
      const map = new DomainUserIdMap();
      map.set(normal1, 1);
      map.set(normal2, 2);
      map.set(convergence1, 3);
      map.set(anonymous2, 4);
      const entries = map.entries();
      expect(entries.length).to.equal(4);
    });
  });

  describe("toGuidObjectMap", () => {
    it("Return the correct mapping using guids", () => {
      const map = new DomainUserIdMap();
      map.set(normal1, 1);
      map.set(normal2, 2);
      map.set(convergence1, 3);
      map.set(anonymous2, 4);

      const expected: any = {};
      expected[normal1.toGuid()] = 1;
      expected[normal2.toGuid()] = 2;
      expected[convergence1.toGuid()] = 3;
      expected[anonymous2.toGuid()] = 4;

      const guidMap = map.toGuidObjectMap();
      expect(guidMap).to.deep.equal(expected);
    });
  });

  describe("fromGuidObjectMap", () => {
    it("Return the correct mapping using guids", () => {
      const guidMap: any = {};
      guidMap[normal1.toGuid()] = 1;
      guidMap[normal2.toGuid()] = 2;
      guidMap[convergence1.toGuid()] = 3;
      guidMap[anonymous2.toGuid()] = 4;

      const map = DomainUserIdMap.fromGuidObjectMap(guidMap);
      expect(map.size()).to.equal(4);
      expect(map.get(normal1)).to.equal(1);
      expect(map.get(normal2)).to.equal(2);
      expect(map.get(convergence1)).to.equal(3);
      expect(map.get(anonymous2)).to.equal(4);
    });
  });
});
