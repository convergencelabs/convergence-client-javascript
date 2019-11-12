/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
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
