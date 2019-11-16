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
import {Deferred} from "../../main/util/Deferred";

describe("DeferredSpec", () => {

  it("calling resolve on the deferred must resolve the promise with the correct valeue", (done) => {
    const resolveVal: string = "resolve";

    const def: Deferred<string> = new Deferred<string>();
    def.promise().then((val: string) => {
      expect(val).to.equal(resolveVal);
      done();
    }).catch(() => {
      done(new Error("The promise was rejected, when it was supposed to be resolved."));
    });

    def.resolve(resolveVal);
  });

  it("calling reject on the deferred must reject the promise with the correct error", (done) => {
    const rejectError: Error = new Error("Test Error");

    const def: Deferred<string> = new Deferred<string>();
    def.promise().then(() => {
      done(new Error("The promise was resolved, when it was supposed to be rejected."));
    }).catch((error: Error) => {
      expect(error).to.equal(rejectError);
      done();
    });

    def.reject(rejectError);
  });
});
