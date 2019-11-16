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
import {RichTextElement} from "../../../main/model/rt/richtext/model/RichTextElement";
import {RichTextDocument} from "../../../main/model/rt/richtext/model/RichTextDocument";
import {RichTextRootElement} from "../../../main/model/rt/richtext/model/RichTextRootElement";
import {AttributeUtils} from "../../../main/model/rt/richtext/model/AttributeUtils";
import {RichTextLocation} from "../../../main/model/rt/richtext/model/RichTextLocation";
import {TestDocumentCreator} from "./documents/TestDocumentCreator";
import {TWO_PARAGRAPHS_WITH_OBJECT} from "./documents/two_paragraphs_with_object";

describe("RichTextLocation", () => {
  describe("constructor", () => {
    it("constructor and getters agree", () => {
      const document = new RichTextDocument();
      const root = new RichTextRootElement(document, "main", "root");
      document.addRoot(root);
      const path = [0, 1];
      const subPath = 4;
      const location = new RichTextLocation(root, path, subPath);

      expect(location.root()).to.equal(root);
      expect(location.path()).to.deep.equal(path);
      expect(location.getSubPath()).to.deep.equal(subPath);
    });

    it("a null root throws and exception.", () => {
      expect(() => new RichTextLocation(null, [], null)).to.throw();
    });

    it("an undefined root throws and exception.", () => {
      expect(() => new RichTextLocation(undefined, [], null)).to.throw();
    });

    it("a null path throws and exception.", () => {
      const document = new RichTextDocument();
      const root = new RichTextRootElement(document, "main", "root");
      document.addRoot(root);
      const subPath = 4;
      expect(() => new RichTextLocation(root, null, subPath)).to.throw();
    });

    it("an undefined path throws and exception.", () => {
      const document = new RichTextDocument();
      const root = new RichTextRootElement(document, "main", "root");
      document.addRoot(root);
      expect(() => new RichTextLocation(root, undefined)).to.throw();
    });
  });

  describe("getParent", () => {
    it("returns null from the root", () => {
      const document = new RichTextDocument();
      const root = new RichTextRootElement(document, "main", "root");
      document.addRoot(root);
      const location = new RichTextLocation(root, []);
      expect(location.getParent()).to.eq(null);
    });

    it("returns the proper parent path", () => {
      const document = new RichTextDocument();
      const root = new RichTextRootElement(document, "main", "root");
      document.addRoot(root);
      const location = new RichTextLocation(root, [2, 1]);
      expect(location.getParent().path()).to.deep.eq([2]);
    });

    it("returns the same root", () => {
      const document = new RichTextDocument();
      const root = new RichTextRootElement(document, "main", "root");
      document.addRoot(root);
      const location = new RichTextLocation(root, [2, 1]);
      expect(location.getParent().root()).to.eq(root);
    });
  });

  describe("getChild", () => {
    it("disallows a less than zero index", () => {
      const document = new RichTextDocument();
      const root = new RichTextRootElement(document, "main", "root");
      document.addRoot(root);
      const location = new RichTextLocation(root, []);
      expect(() => location.getChild(-1)).to.throw();
    });

    it("returns the same root", () => {
      const document = new RichTextDocument();
      const root = new RichTextRootElement(document, "main", "root");
      document.addRoot(root);
      const location = new RichTextLocation(root, [2, 1]);
      expect(location.getChild(1).root()).to.eq(root);
    });

    it("returns the correct child path", () => {
      const document = new RichTextDocument();
      const root = new RichTextRootElement(document, "main", "root");
      document.addRoot(root);
      const location = new RichTextLocation(root, [2, 1]);
      expect(location.getChild(3).path()).to.deep.eq([2, 1, 3]);
    });
  });

  describe("getNearestCommonAncestor", () => {
    it("finds the correct common ancestor", () => {
      const document = new RichTextDocument();
      const root = new RichTextRootElement(document, "main", "root");
      document.addRoot(root);
      const location1 = new RichTextLocation(root, [0, 2, 2, 4]);
      const location2 = new RichTextLocation(root, [0, 2, 3, 8, 4]);

      const parent = location1.getNearestCommonAncestor(location2);
      expect(parent.path()).to.deep.eq([0, 2]);
    });

    it("is associative", () => {
      const document = new RichTextDocument();
      const root = new RichTextRootElement(document, "main", "root");
      document.addRoot(root);
      const location1 = new RichTextLocation(root, [0, 2, 2, 4]);
      const location2 = new RichTextLocation(root, [0, 2, 3, 8, 4]);
      expect(location1.getNearestCommonAncestor(location2).path()).to.deep.eq(
        location2.getNearestCommonAncestor(location1).path());
    });

    it("handles identical paths", () => {
      const document = new RichTextDocument();
      const root = new RichTextRootElement(document, "main", "root");
      document.addRoot(root);
      const location1 = new RichTextLocation(root, [0, 2, 2, 4]);
      const location2 = new RichTextLocation(root, [0, 2, 2, 4]);
      const parent = location1.getNearestCommonAncestor(location2);
      expect(parent.path()).to.deep.eq([0, 2, 2, 4]);
    });

    it("correctly handles a root and non-root path", () => {
      const document = new RichTextDocument();
      const root = new RichTextRootElement(document, "main", "root");
      document.addRoot(root);
      const location1 = new RichTextLocation(root, []);
      const location2 = new RichTextLocation(root, [0, 2, 2, 4]);
      const parent = location1.getNearestCommonAncestor(location2);
      expect(parent.path()).to.deep.eq([]);
    });

    it("returns the same root", () => {
      const document = new RichTextDocument();
      const root = new RichTextRootElement(document, "main", "root");
      document.addRoot(root);
      const location1 = new RichTextLocation(root, [0, 2, 2, 4]);
      const location2 = new RichTextLocation(root, [0, 2, 3, 8, 4]);
      const parent = location1.getNearestCommonAncestor(location2);
      expect(parent.root()).to.eq(root);
    });

    it("disallows locations with different roots", () => {
      const document = new RichTextDocument();
      const root1 = new RichTextRootElement(document, "main", "root");
      const location1 = new RichTextLocation(root1, [0, 2, 2, 4]);
      const root2 = new RichTextRootElement(document, "main", "root");
      const location2 = new RichTextLocation(root2, [0, 2, 3, 8, 4]);
      expect(() => location1.getNearestCommonAncestor(location2)).to.throw();
    });

    it("passing null throws an error", () => {
      const document = new RichTextDocument();
      const root = new RichTextRootElement(document, "main", "root");
      const location = new RichTextLocation(root, [0, 2, 2, 4]);
      expect(() => location.getNearestCommonAncestor(null)).to.throw();
    });

    it("getting offset location", () => {
      const document = TestDocumentCreator.createDocument(TWO_PARAGRAPHS_WITH_OBJECT);
      const root = document.getRoot("main");
      const location = RichTextLocation.ofTextOffset(root, 2);
    });
  });
});
