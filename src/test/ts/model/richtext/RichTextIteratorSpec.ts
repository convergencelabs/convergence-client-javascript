import {expect} from "chai";
import {TestDocumentCreator} from "./documents/TestDocumentCreator";
import {TWO_PARAGRAPHS} from "./documents/two_paragraphs";
import {RichTextIterator, RichTextIteratorOptions} from "../../../../main/ts/model/rt/richtext/RichTextIterator";
import {RichTextLocation} from "../../../../main/ts/model/rt/richtext/RichTextLocation";
import {RichTextContentType} from "../../../../main/ts/model/rt/richtext/RichTextContentType";
import {StringMap} from "../../../../main/ts/util/StringMap";

describe("RichTextIterator", () => {
  describe("constructor", () => {
    it("foo", () => {
      const doc = TestDocumentCreator.createDocument(TWO_PARAGRAPHS);
      const root = doc.getRoot("main");
      const options: RichTextIteratorOptions = {
        startLocation: RichTextLocation.ofRoot(root)
      };
      const iterator = new RichTextIterator(options);

      const expectedOrder: IterationExpectation[] = [];
      expectedOrder.push({type: "root", rootName: "main", name: "doc"});
      expectedOrder.push({type: "element", name: "paragraph", attributes: {}});
      expectedOrder.push({type: "string", data: "Here is some text. ", attributes: {}});
      expectedOrder.push({type: "string", data: "This text is bold. ", attributes: {bold: true}});
      expectedOrder.push({type: "string", data: "But this text is not. ", attributes: {}});
      expectedOrder.push({type: "element", name: "paragraph", attributes: {}});
      expectedOrder.push({type: "string", data: "This is another paragraph.", attributes: {}});

      for (let node of iterator) {
        console.log(node.toString());
      }
    });
  });
});

interface IterationExpectation {
  type: RichTextContentType;
  name?: string;
  rootName?: string;
  attributes?: StringMap;
  data?: string;
}
