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

import {
  RichTextDocument,
  RichTextLocation,
  RichTextMutator,
  RichTextRootElement,
  RichTextString
} from "../../../main/model/rt/richtext/model/";

import {expect} from "chai";
import {StringMap} from "../../../main/util";

describe("RichTextMutator", () => {
  describe("insert", () => {
    it("Insert", () => {
      const doc = new RichTextDocument();
      const root = new RichTextRootElement(doc, "default", "doc");
      doc.addRoot(root);
      const mutator = new RichTextMutator(doc);

      const str = new RichTextString(doc, null, "test");
      const insertLoc = root.location().withSubPath(0);
      mutator.insert(insertLoc, str);

      expect(root.childCount()).to.eq(1);
      expect(root.getChild(0)).to.be.an.instanceOf(RichTextString);
    });

    it("Insert string into existing string", () => {
      const doc = new RichTextDocument();
      const root = new RichTextRootElement(doc, "default", "doc");
      doc.addRoot(root);
      const mutator = new RichTextMutator(doc);

      root.appendChild(new RichTextString(doc, null, "some text"));

      const insertLoc = root.location().withChild(0).withSubPath(4);
      mutator.insert(insertLoc, new RichTextString(doc, null, " more"));

      expect(root.childCount()).to.eq(1);
      const child = root.getChild(0) as RichTextString;
      expect(child).to.be.an.instanceOf(RichTextString);
      expect(child.getData()).to.eq("some more text");
    });
  });

  describe("insertText", () => {
    it("Insert in empty root element", () => {
      const {mutator, root} = emptyTestData();

      mutator.insertText(RichTextLocation.ofTextOffset(root, 0), "some text");

      expect(root.childCount()).to.eq(1);
      const child = root.getChild(0) as RichTextString;
      expect(child).to.be.an.instanceOf(RichTextString);
      expect(child.getData()).to.eq("some text");
    });

    it("Insert in existing string with no attributes", () => {
      const {mutator, root} = emptyTestData();

      mutator.insertText(RichTextLocation.ofTextOffset(root, 0), "some text");
      mutator.insertText(RichTextLocation.ofTextOffset(root, 4), " more");

      expect(root.childCount()).to.eq(1);
      const child = root.getChild(0) as RichTextString;
      expect(child).to.be.an.instanceOf(RichTextString);
      expect(child.getData()).to.eq("some more text");
    });

    it("Insert at end of existing string", () => {
      const {mutator, root} = emptyTestData();

      mutator.insertText(RichTextLocation.ofTextOffset(root, 0), "0123");
      mutator.insertText(RichTextLocation.ofTextOffset(root, 4), "4");

      expect(root.childCount()).to.eq(1);
      const child = root.getChild(0) as RichTextString;
      expect(child).to.be.an.instanceOf(RichTextString);
      expect(child.getData()).to.eq("01234");
    });

    it("Insert at beginning of existing string", () => {
      const {mutator, root} = emptyTestData();

      mutator.insertText(RichTextLocation.ofTextOffset(root, 0), "1234");
      mutator.insertText(RichTextLocation.ofTextOffset(root, 0), "0");

      expect(root.childCount()).to.eq(1);
      const child = root.getChild(0) as RichTextString;
      expect(child).to.be.an.instanceOf(RichTextString);
      expect(child.getData()).to.eq("01234");
    });

    it("Insert in existing string with different attributes", () => {
      const {mutator, root} = emptyTestData();

      mutator.insertText(RichTextLocation.ofTextOffset(root, 0), "1234", {bold: false});
      mutator.insertText(RichTextLocation.ofTextOffset(root, 2), "X", {bold: true});

      expect(root.childCount()).to.eq(3);

      const child1 = root.getChild(0) as RichTextString;
      expect(child1).to.be.an.instanceOf(RichTextString);
      expect(child1.getData()).to.eq("12");
      expect(child1.attributes()).to.deep.equal(StringMap.toStringMap({bold: false}));

      const child2 = root.getChild(1) as RichTextString;
      expect(child2).to.be.an.instanceOf(RichTextString);
      expect(child2.getData()).to.eq("X");
      expect(child2.attributes()).to.deep.equal(StringMap.toStringMap({bold: true}));

      const child3 = root.getChild(2) as RichTextString;
      expect(child3).to.be.an.instanceOf(RichTextString);
      expect(child3.getData()).to.eq("34");
      expect(child3.attributes()).to.deep.equal(StringMap.toStringMap({bold: false}));
    });
  });
});

function emptyTestData(): {
  doc: RichTextDocument,
  mutator: RichTextMutator,
  root: RichTextRootElement
} {
  const doc = new RichTextDocument();
  const root = new RichTextRootElement(doc, "default", "doc");
  doc.addRoot(root);
  const mutator = new RichTextMutator(doc);
  return {doc, mutator, root};
}
