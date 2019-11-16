/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3 
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "LICENSE" and
 * "LICENSE.LGPL" files (respectively), which are part of this source code 
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3 
 * and LGPLv3 licenses, if they were not provided.
 */

import {EqualsUtil} from "../../main/util/EqualsUtil";
import {expect} from "chai";

describe("EqualUtil", () => {

  it("NaN and NaN are equal", () => {
    expect(EqualsUtil.deepEquals(NaN, NaN)).to.be.true;
  });

  it("NaN and non NaN are unequal", () => {
    expect(EqualsUtil.deepEquals(NaN, 0)).to.be.false;
  });

  it("equal booleans are equal", () => {
    expect(EqualsUtil.deepEquals(true, true)).to.be.true;
  });

  it("unequal booleans are unequal", () => {
    expect(EqualsUtil.deepEquals(true, false)).to.be.false;
  });

  it("equal numbers are equal", () => {
    expect(EqualsUtil.deepEquals(4, 4)).to.be.true;
  });

  it("unequal numbers are unequal", () => {
    expect(EqualsUtil.deepEquals(4, 5)).to.be.false;
  });

  it("equal strings are equal", () => {
    expect(EqualsUtil.deepEquals("foo", "foo")).to.be.true;
  });

  it("unequal numbers are unequal", () => {
    expect(EqualsUtil.deepEquals("foo", "bar")).to.be.false;
  });

  it("null is equal to null", () => {
    expect(EqualsUtil.deepEquals(null, null)).to.be.true;
  });

  it("null is not equal to non null values", () => {
    expect(EqualsUtil.deepEquals(null, 2)).to.be.false;
  });

  it("equal arrays are equal", () => {
    const x = [1, "2", false, null];
    const y = [1, "2", false, null];
    expect(EqualsUtil.deepEquals(x, y)).to.be.true;
  });

  it("unequal arrays are unequal", () => {
    const x = [1, "2", false, null];
    const y = [1, "2", true, null];
    expect(EqualsUtil.deepEquals(x, y)).to.be.false;
  });

  it("Equal complex objects are equal", () => {
    const x = {
      a: "foo",
      b: false,
      c: {
        x: 4
      },
      d: null,
      e: [1, "2", true, null]
    };

    const y = {
      a: "foo",
      b: false,
      c: {
        x: 4
      },
      d: null,
      e: [1, "2", true, null]
    };

    expect(EqualsUtil.deepEquals(x, y)).to.be.true;
  });

  it("Unequal complex objects are unequal", () => {
    const x = {
      a: "foo",
      b: false,
      c: {
        x: 3
      },
      d: null,
      e: [1, "2", true, null]
    };

    const y = {
      a: "foo",
      b: false,
      c: {
        x: 4
      },
      d: null,
      e: [1, "2", true, null]
    };

    expect(EqualsUtil.deepEquals(x, y)).to.be.false;
  });
});
