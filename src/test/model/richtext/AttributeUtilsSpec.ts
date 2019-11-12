/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
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
