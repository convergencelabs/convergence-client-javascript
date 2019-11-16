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

import {RichTextDocument} from "../../../main/model/rt/richtext/model/RichTextDocument";
import {RichTextRootElement} from "../../../main/model/rt/richtext/model/RichTextRootElement";

describe("RichTextMutator", () => {
  describe("constructor", () => {
    it("Initial document has not roots", () => {
      const doc = new RichTextDocument();
      expect(doc.getRoots().size).to.eq(0);
    });
  });

  describe("#addRoot()", () => {
    it("Initial document has not roots", () => {
      const doc = new RichTextDocument();
      const root = new RichTextRootElement(doc, "main", "doc");
      doc.addRoot(root);
      expect(doc.getRoots().get(root.getRootName())).to.eq(root);
    });

    it("Adding a null root throws and error", () => {
      const doc = new RichTextDocument();
      expect(() => doc.addRoot(null)).to.throw();
    });

    it("Adding an undefined root throws and error", () => {
      const doc = new RichTextDocument();
      expect(() => doc.addRoot(undefined)).to.throw();
    });

    it("Adding a duplicate root name throws an error", () => {
      const doc = new RichTextDocument();
      const root = new RichTextRootElement(doc, "main", "doc");
      const root2 = new RichTextRootElement(doc, "main", "doc");
      doc.addRoot(root);
      expect(() => doc.addRoot(root2)).to.throw();
    });
  });

  describe("#getRoots()", () => {
    it("Returns all and only added roots", () => {
      const doc = new RichTextDocument();
      const root1 = new RichTextRootElement(doc, "root1", "doc");
      const root2 = new RichTextRootElement(doc, "root2", "doc");
      doc.addRoot(root1);
      doc.addRoot(root2);
      const roots = doc.getRoots();
      expect(roots.size).to.eq(2);
      expect(roots.get(root1.getRootName())).to.equal(root1);
      expect(roots.get(root2.getRootName())).to.equal(root2);
    });
  });
});
