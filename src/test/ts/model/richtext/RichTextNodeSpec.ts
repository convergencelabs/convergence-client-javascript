import {expect} from "chai";
import {RichTextDocument} from "../../../../main/ts/model/rt/richtext/model/RichTextDocument";
import {RichTextRootElement} from "../../../../main/ts/model/rt/richtext/model/RichTextRootElement";
import {AttributeUtils} from "../../../../main/ts/model/rt/richtext/model/AttributeUtils";
import {RichTextNode} from "../../../../main/ts/model/rt/richtext/model/RichTextNode";
import {RichTextContentType} from "../../../../main/ts/model/rt/richtext/model/RichTextContentType";
import {RichTextElement} from "../../../../main/ts/model/rt/richtext/model";

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
