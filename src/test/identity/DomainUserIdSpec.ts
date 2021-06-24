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

import {DomainUserId, DomainUserType} from "../../main";

import {expect} from "chai";

const normalUsername = "NormalUser";
const convergenceUsername = "ConvergenceUser";
const anonymousUsername = "AnonymousUser";

describe("DomainUserId", () => {

  describe("constructor", () => {
    it("Properly constructs a normal user", () => {
      const normal = new DomainUserId(DomainUserType.NORMAL, normalUsername);
      expect(normal.userType).to.equal(DomainUserType.NORMAL);
      expect(normal.username).to.equal(normalUsername);
    });

    it("Properly constructs a convergence user", () => {
      const normal = new DomainUserId(DomainUserType.CONVERGENCE, convergenceUsername);
      expect(normal.userType).to.equal(DomainUserType.CONVERGENCE);
      expect(normal.username).to.equal(convergenceUsername);
    });

    it("Properly constructs an anonymous user", () => {
      const normal = new DomainUserId(DomainUserType.ANONYMOUS, anonymousUsername);
      expect(normal.userType).to.equal(DomainUserType.ANONYMOUS);
      expect(normal.username).to.equal(anonymousUsername);
    });
  });

  describe("of", () => {
    it("Properly constructs a normal user from a string", () => {
      const normal = DomainUserId.normal(normalUsername);
      expect(DomainUserId.of(normalUsername).equals(normal)).to.be.true;
    });

    it("Properly returns a DomainUserId", () => {
      const convergence = DomainUserId.convergence(convergenceUsername);
      expect(DomainUserId.of(convergence).equals(convergence)).to.be.true;
    });
  });

  describe("user type factory methods", () => {
    it("Properly constructs a normal user", () => {
      const normal = DomainUserId.normal(normalUsername);
      expect(normal.userType).to.equal(DomainUserType.NORMAL);
      expect(normal.username).to.equal(normalUsername);
    });

    it("Properly constructs a convergence user", () => {
      const normal = DomainUserId.convergence(convergenceUsername);
      expect(normal.userType).to.equal(DomainUserType.CONVERGENCE);
      expect(normal.username).to.equal(convergenceUsername);
    });

    it("Properly constructs an anonymous user", () => {
      const normal = DomainUserId.anonymous(anonymousUsername);
      expect(normal.userType).to.equal(DomainUserType.ANONYMOUS);
      expect(normal.username).to.equal(anonymousUsername);
    });
  });

  describe("equals", () => {
    it("Users with the same type and username must be equal", () => {
      const u1 = DomainUserId.normal("username");
      const u2 = DomainUserId.normal("username");
      expect(u1.equals(u2)).to.be.true;
    });

    it("Users with the same type and different usernames must not be equal", () => {
      const u1 = DomainUserId.normal("username");
      const u2 = DomainUserId.normal("username1");
      expect(u1.equals(u2)).to.be.false;
    });

    it("Users with different types and the same usernames must not be equal", () => {
      const u1 = DomainUserId.normal("username");
      const u2 = DomainUserId.convergence("username");
      expect(u1.equals(u2)).to.be.false;
    });
  });

  describe("guid", () => {
    it("toGuid and fromGuid should agree", () => {
      const u1 = DomainUserId.normal("username");
      const guid = u1.toGuid()
      const u2 = DomainUserId.fromGuid(guid);
      expect(u1.equals(u2)).to.be.true;
    });

    it("fromGuid must handle a username with a : in it.", () => {
      const u1 = DomainUserId.normal("user:name");
      const guid = u1.toGuid()
      const u2 = DomainUserId.fromGuid(guid);
      expect(u1.equals(u2)).to.be.true;
    });

    it("fromGuid must reject an empty string", () => {
      expect(() => DomainUserId.fromGuid("")).to.throw
    });

    it("fromGuid must reject undefined", () => {
      expect(() => DomainUserId.fromGuid(undefined)).to.throw
    });

    it("fromGuid must reject null", () => {
      expect(() => DomainUserId.fromGuid(null)).to.throw
    });

    it("fromGuid must reject a string with the wrong format", () => {
      expect(() => DomainUserId.fromGuid("normal/username")).to.throw
    });

    it("fromGuid must reject a string with an invalid userType", () => {
      expect(() => DomainUserId.fromGuid("unknown:username")).to.throw
    });
  });
});
