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
import {ConvergenceDomain, IConvergenceOptions} from "../main";
import * as WebSocket from "ws";

const OPTIONS: IConvergenceOptions = {
  webSocket: {
    factory: (u) => new WebSocket(u, {rejectUnauthorized: false}),
    class: WebSocket
  }
};

describe("ConvergenceDomain", () => {
  describe("constructor()", () => {
    it("Is not disposed after construction", () => {
      const domain = new ConvergenceDomain("wss://localhost/namespace/domain", OPTIONS);
      expect(domain.isDisposed()).to.be.false;
      expect(domain.namespace()).to.equal("namespace");
      expect(domain.id()).to.equal("domain");
    });

    it("Accepts valid http url", () => {
      const domain = new ConvergenceDomain("http://localhost/namespace/domain", OPTIONS);
      expect(domain.namespace()).to.equal("namespace");
      expect(domain.id()).to.equal("domain");
    });

    it("Accepts valid https url", () => {
      const domain = new ConvergenceDomain("https://localhost/namespace/domain", OPTIONS);
      expect(domain.namespace()).to.equal("namespace");
      expect(domain.id()).to.equal("domain");
    });

    it("Accepts valid ws url", () => {
      const domain = new ConvergenceDomain("ws://localhost/namespace/domain", OPTIONS);
      expect(domain.namespace()).to.equal("namespace");
      expect(domain.id()).to.equal("domain");
    });

    it("Accepts valid wss url", () => {
      const domain = new ConvergenceDomain("wss://localhost/namespace/domain", OPTIONS);
      expect(domain.namespace()).to.equal("namespace");
      expect(domain.id()).to.equal("domain");
    });

    it("Accepts a url with context path", () => {
      const domain = new ConvergenceDomain("wss://localhost/a/b/namespace/domain", OPTIONS);
      expect(domain.namespace()).to.equal("namespace");
      expect(domain.id()).to.equal("domain");
    });

    it("Accepts a url with a port", () => {
      const domain = new ConvergenceDomain("wss://localhost:8000/namespace/domain", OPTIONS);
      expect(domain.namespace()).to.equal("namespace");
      expect(domain.id()).to.equal("domain");
    });

    it("Rejects a url with no domain", () => {
      expect(() => new ConvergenceDomain("wss://localhost/namespace/", OPTIONS)).to.throw();
    });

    it("Rejects a url with a no namespace or domain", () => {
      expect(() => new ConvergenceDomain("wss://localhost/", OPTIONS)).to.throw();
    });

    it("Rejects a null url", () => {
      expect(() => new ConvergenceDomain(null, OPTIONS)).to.throw();
    });

    it("Rejects an undefined url", () => {
      expect(() => new ConvergenceDomain(undefined, OPTIONS)).to.throw();
    });

    it("Rejects an empty url", () => {
      expect(() => new ConvergenceDomain("", OPTIONS)).to.throw();
    });
  });
});
