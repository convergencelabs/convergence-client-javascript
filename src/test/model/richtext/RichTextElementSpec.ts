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
import {RichTextElement} from "../../../main/model/rt/richtext/model/RichTextElement";
import {RichTextDocument} from "../../../main/model/rt/richtext/model/RichTextDocument";
import {RichTextRootElement} from "../../../main/model/rt/richtext/model/RichTextRootElement";
import {AttributeUtils} from "../../../main/model/rt/richtext/model/AttributeUtils";

describe("RichTextElement", () => {
  describe("constructor", () => {
    it("constructor and getters agree", () => {
      const document = new RichTextDocument();
      const root = new RichTextRootElement(document, "main", "root");
      document.addRoot(root);
      const attrs = new Map<string, any>();
      attrs.set("foo", "bar");
      const name = "paragraph";
      const element = new RichTextElement(document, root, name, attrs);

      expect(element.childCount()).to.equal(0);
      expect(element.getName()).to.equal(name);
      expect(element.document()).to.equal(document);
      expect(element.root()).to.equal(root);
      expect(AttributeUtils.areAttributesEqual(element.attributes(), attrs)).to.be.true;
    });

    it("omitting attribute map creates empty attributes", () => {
      const document = new RichTextDocument();
      const root = new RichTextRootElement(document, "main", "root");
      document.addRoot(root);
      const attrs = new Map<string, any>();
      attrs.set("foo", "bar");
      const name = "paragraph";
      const element = new RichTextElement(document, root, name);

      expect(element.attributes().size).to.equal(0);
    });
  });
});
