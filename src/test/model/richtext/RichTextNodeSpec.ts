/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
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
