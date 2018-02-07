import {expect} from "chai";


import {TestDocumentCreator} from "./documents/TestDocumentCreator";
import {TWO_PARAGRAPHS} from "./documents/two_paragraphs";
import {RichTextIterator, RichTextIteratorOptions} from "../../../../main/ts/model/rt/richtext/RichTextIterator";
import {RichTextLocation} from "../../../../main/ts/model/rt/richtext/RichTextLocation";

describe("RichTextIterator", () => {
  describe("constructor", () => {
    it("foo", () => {
      const doc = TestDocumentCreator.createDocument(TWO_PARAGRAPHS);
      const root = doc.getRoot("main");
      const options: RichTextIteratorOptions = {
        startLocation: RichTextLocation.ofRoot(root)
      };
      const iterator = new RichTextIterator(options);
    });
  });
});
