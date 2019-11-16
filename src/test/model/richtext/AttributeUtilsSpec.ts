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

import {expect} from "chai";
import {AttributeUtils} from "../../../main/model/rt/richtext/model/AttributeUtils";

describe("AttributeUtils", () => {
  describe("areAttributesEqual", () => {
    it("returns true for empty maps", () => {
      const a = new Map<string, any>();
      const b = new Map<string, any>();
      expect(AttributeUtils.areAttributesEqual(a, b)).to.be.true;
    });

    it("returns false for one empty map and a non-empty map", () => {
      const a = new Map<string, any>();
      const b = new Map<string, any>();
      b.set("test", false);
      expect(AttributeUtils.areAttributesEqual(a, b)).to.be.false;
    });

    it("returns false for maps with different attribute values", () => {
      const a = new Map<string, any>();
      a.set("same", 0);
      a.set("different", true);

      const b = new Map<string, any>();
      b.set("same", 0);
      b.set("different", false);

      expect(AttributeUtils.areAttributesEqual(a, b)).to.be.false;
    });

    it("returns true for maps with same attribute values", () => {
      const a = new Map<string, any>();
      a.set("1", 0);
      a.set("2", true);

      const b = new Map<string, any>();
      b.set("1", 0);
      b.set("2", true);

      expect(AttributeUtils.areAttributesEqual(a, b)).to.be.true;
    });
  });
});
