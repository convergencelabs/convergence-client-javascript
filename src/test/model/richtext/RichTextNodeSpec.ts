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
import {AttributeUtils} from "../../../main/model/rt/richtext/model/AttributeUtils";
import {RichTextNode} from "../../../main/model/rt/richtext/model/RichTextNode";
import {RichTextContentType} from "../../../main/model/rt/richtext/model/RichTextContentType";
import {RichTextElement} from "../../../main/model/rt/richtext/model";

describe("RichTextNode", () => {
  describe("constructor", () => {
    it("constructor and getters agree", () => {
      const document = new RichTextDocument();
      const root = new RichTextRootElement(document, "main", "root");
      document.addRoot(root);
      const attrs = new Map<string, any>();
      attrs.set("foo", "bar");

      const node = new TestRichTextNode(document, root, attrs);
      expect(node.document()).to.equal(document);
      expect(node.root()).to.equal(root);
      expect(node.parent()).to.equal(root);
      // tslint:disable-next-line
      expect(AttributeUtils.areAttributesEqual(node.attributes(), attrs)).to.be.true;
    });

    it("omitting attribute map creates empty attributes", () => {
      const document = new RichTextDocument();
      const root = new RichTextRootElement(document, "main", "root");
      document.addRoot(root);
      const node = new TestRichTextNode(document, root);
      expect(node.document()).to.equal(document);
      expect(node.root()).to.equal(root);
      expect(node.parent()).to.equal(root);
      expect(node.attributes().size).to.equal(0);
    });

    it("A null document in the constructor throws and error", () => {
      const document = new RichTextDocument();
      const root = new RichTextRootElement(document, "main", "root");
      document.addRoot(root);
      expect(() => new TestRichTextNode(null, root)).to.throw();
    });
  });
});

class TestRichTextNode extends RichTextNode {
  constructor(document: RichTextDocument, parent: RichTextElement, attributes?: Map<string, any>) {
    super(document, parent, attributes);
  }

  public textContentLength(): number {
    return 0;
  }

  public type(): RichTextContentType {
    return null;
  }

  public isA(type: RichTextContentType): boolean {
    return false;
  }

  public isLeaf(): boolean {
    return true;
  }
}
