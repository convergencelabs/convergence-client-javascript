import {expect} from "chai";
import {TestDocumentCreator} from "./documents/TestDocumentCreator";
import {TWO_PARAGRAPHS} from "./documents/two_paragraphs";
import {RichTextIterator, RichTextIteratorOptions} from "../../../../main/ts/model/rt/richtext/RichTextIterator";
import {RichTextLocation} from "../../../../main/ts/model/rt/richtext/RichTextLocation";
import {RichTextIterationValidator} from "./documents/RichTextIterationValidator";
import {RichTextString} from "../../../../main/ts/model/rt/richtext/RichTextString";
import {RichTextRange} from "../../../../main/ts/model/rt/richtext/RichTextRange";

describe("RichTextIterator", () => {
  it("Full forward traversal from root", () => {
    const doc = TestDocumentCreator.createDocument(TWO_PARAGRAPHS);
    const root = doc.getRoot("main");
    const options: RichTextIteratorOptions = {
      startLocation: RichTextLocation.ofRoot(root)
    };
    const iterator = new RichTextIterator(options);
    const validator = new RichTextIterationValidator(iterator);

    validator.addNodeExpectation(root);
    validator.addNodeExpectation(root.getChildByPath([0]));
    validator.addNodeExpectation(root.getChildByPath([0, 0]));
    validator.addNodeExpectation(root.getChildByPath([0, 1]));
    validator.addNodeExpectation(root.getChildByPath([0, 2]));
    validator.addNodeExpectation(root.getChildByPath([1]));
    validator.addNodeExpectation(root.getChildByPath([1, 0]));
    validator.validate();
  });

  it("Traversal from child to the end of tree", () => {
    const doc = TestDocumentCreator.createDocument(TWO_PARAGRAPHS);
    const root = doc.getRoot("main");
    const startString = root.getChildByPath([0, 1]);
    const options: RichTextIteratorOptions = {
      startLocation: RichTextLocation.ofContent(startString)
    };

    const iterator = new RichTextIterator(options);
    const validator = new RichTextIterationValidator(iterator);

    validator.addNodeExpectation(root.getChildByPath([0, 1]));
    validator.addNodeExpectation(root.getChildByPath([0, 2]));
    validator.addNodeExpectation(root.getChildByPath([1]));
    validator.addNodeExpectation(root.getChildByPath([1, 0]));
    validator.validate();
  });

  it("Traversal from within a string to the end of tree", () => {
    const doc = TestDocumentCreator.createDocument(TWO_PARAGRAPHS);
    const root = doc.getRoot("main");
    const startString = root.getChildByPath([0, 1]) as RichTextString;
    const options: RichTextIteratorOptions = {
      startLocation: RichTextLocation.ofStringIndex(startString, 4)
    };

    const iterator = new RichTextIterator(options);
    const validator = new RichTextIterationValidator(iterator);

    validator.addStringFragmentExpectation(startString, 4);
    validator.addNodeExpectation(root.getChildByPath([0, 2]));
    validator.addNodeExpectation(root.getChildByPath([1]));
    validator.addNodeExpectation(root.getChildByPath([1, 0]));
    validator.validate();
  });

  it("Traversal from root to within a string", () => {
    const doc = TestDocumentCreator.createDocument(TWO_PARAGRAPHS);
    const root = doc.getRoot("main");
    const startLocation = RichTextLocation.ofRoot(root);
    const endString = root.getChildByPath([0, 2]) as RichTextString;
    const endLocation = RichTextLocation.ofStringIndex(endString, 4);
    const options: RichTextIteratorOptions = {
      range: new RichTextRange(startLocation, endLocation)
    };
    const iterator = new RichTextIterator(options);
    const validator = new RichTextIterationValidator(iterator);

    validator.addNodeExpectation(root);
    validator.addNodeExpectation(root.getChildByPath([0]));
    validator.addNodeExpectation(root.getChildByPath([0, 0]));
    validator.addNodeExpectation(root.getChildByPath([0, 1]));
    validator.addStringFragmentExpectation(endString, 0, 4);
    validator.validate();
  });
});
