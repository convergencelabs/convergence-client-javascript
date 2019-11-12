/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {expect} from "chai";
import {QuillDeltaConverter} from "../../../../../main/model/rt/richtext/adapters/quill";
import {RichTextDocument} from "../../../../../main/model/rt/richtext/model/RichTextDocument";
import {RichTextRootElement} from "../../../../../main/model/rt/richtext/model/RichTextRootElement";
import * as Delta from "quill-delta";
import {RichTextString} from "../../../../../main/model/rt/richtext/model/RichTextString";
import {StringMap} from "../../../../../main/util";
import {RichTextElement} from "../../../../../main/model/rt/richtext/model/RichTextElement";
import {TestDocumentCreator} from "../../documents/TestDocumentCreator";

describe("DeltaConverter", () => {
  describe("#deltaToRoot", () => {
    it("Simple document with styles.", () => {
      const ops = [
        {insert: "Gandalf", attributes: {bold: true}},
        {insert: " the "},
        {insert: "Grey", attributes: {color: "#ccc"}}
      ];
      const delta = new Delta(ops);

      const doc: RichTextDocument = new RichTextDocument();
      const root: RichTextRootElement = QuillDeltaConverter.deltaToRoot(delta, doc);

      expect(root.getChildren().length).to.eq(3);

      const node0: RichTextString = root.getChild(0) as RichTextString;
      expect(node0 instanceof RichTextString).to.eq(true);
      expect(node0.getData()).to.eq(ops[0].insert);
      expect(StringMap.mapToObject(node0.attributes())).to.deep.eq(ops[0].attributes || {});

      const node1: RichTextString = root.getChild(1) as RichTextString;
      expect(node1 instanceof RichTextString).to.eq(true);
      expect(node1.getData()).to.eq(ops[1].insert);
      expect(StringMap.mapToObject(node1.attributes())).to.deep.eq(ops[1].attributes || {});

      const node2: RichTextString = root.getChild(2) as RichTextString;
      expect(node2 instanceof RichTextString).to.eq(true);
      expect(node2.getData()).to.eq(ops[2].insert);
      expect(StringMap.mapToObject(node2.attributes())).to.deep.eq(ops[2].attributes || {});
    });
  });

  it("Embedded.", () => {
    const ops = [
      {insert: "Before", attributes: {bold: true}},
      {insert: {image: "url"}, attributes: {border: 1}},
      {insert: "After", attributes: {color: "#ccc"}}
    ];
    const delta = new Delta(ops);

    const doc: RichTextDocument = new RichTextDocument();
    const root: RichTextRootElement = QuillDeltaConverter.deltaToRoot(delta, doc);

    expect(root.getChildren().length).to.eq(3);

    const node0: RichTextString = root.getChild(0) as RichTextString;
    expect(node0 instanceof RichTextString).to.eq(true);
    expect(node0.getData()).to.eq(ops[0].insert);
    expect(node0.attributes()).to.deep.eq(StringMap.toStringMap(ops[0].attributes || {}));

    const node1: RichTextElement = root.getChild(1) as RichTextElement;
    expect(node1 instanceof RichTextElement).to.eq(true);
    expect(node1.getName()).to.eq("image");

    const expected = {
      $$ConvergenceQuillBlotValue$$: "url",
      ...ops[1].attributes
    };
    const attrs = StringMap.mapToObject(node1.attributes());
    expect(attrs).to.deep.eq(expected);

    const node2: RichTextString = root.getChild(2) as RichTextString;
    expect(node2 instanceof RichTextString).to.eq(true);
    expect(node2.getData()).to.eq(ops[2].insert);
    expect(node2.attributes()).to.deep.eq(StringMap.toStringMap(ops[2].attributes || {}));
  });

  describe("#docToDelta", () => {
    it("Simple document with styles.", () => {
      const doc: RichTextDocument = TestDocumentCreator.createDocument({
        quill: {
          name: "delta",
          children: [
            {type: "string", data: "Gandalf", attributes: {bold: true}},
            {type: "string", data: " the "},
            {type: "string", data: "Grey", attributes: {color: "#ccc"}}
          ]
        }
      });

      const delta: Delta = QuillDeltaConverter.docToDelta(doc);
      expect(delta.ops).to.deep.eq([
        {insert: "Gandalf", attributes: {bold: true}},
        {insert: " the "},
        {insert: "Grey", attributes: {color: "#ccc"}}
      ]);
    });
  });
});
