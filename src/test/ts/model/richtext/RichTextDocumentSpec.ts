import {expect} from "chai";

import {RichTextDocument} from "../../../../main/ts/model/rt/richtext/RichTextDocument";
import {TestDocumentCreator} from "./documents/TestDocumentCreator";
import {TWO_PARAGRAPHS} from "./documents/two_paragraphs";

describe("RichTextDocument", () => {
  describe("constructor", () => {
    it("foo", () => {
      const doc = TestDocumentCreator.createDocument(TWO_PARAGRAPHS);
    });
  });
});
