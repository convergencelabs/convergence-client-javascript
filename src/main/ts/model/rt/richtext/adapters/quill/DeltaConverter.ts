import {Delta, DeltaOperation} from "quill";
import {RichTextDocument} from "../../model/RichTextDocument";
import {RichTextRootElement} from "../../model/RichTextRootElement";
import {RichTextString} from "../../model/RichTextString";
import {RichTextElement} from "../../model/RichTextElement";
import {StringMap} from "../../../../../util";
import {RichTextNode} from "../../model/RichTextNode";

const ROOT_NAME: string = "quill";
const ROOT_ELEMENT_NAME = "delta";
const BLOT_VALUE_ATTR: string = "$$blotValue";

export class DeltaConverter {

  public static getRoot(doc: RichTextDocument): RichTextRootElement {
    return doc.getRoot(ROOT_NAME);
  }

  public static docToDelta(doc: RichTextDocument): Delta {
    const root: RichTextRootElement = doc.getRoot(ROOT_NAME);
    const deltaOps: DeltaOperation[] = root.getChildren().map((child) => {
      if (child instanceof RichTextString) {
        return {
          insert: child.getData(),
          attributes: StringMap.mapToObject(child.attributes())
        };
      } else if (child instanceof RichTextElement) {
        const insert: any = {};
        const blotName = child.getName();
        const blotValue = child.getAttribute(BLOT_VALUE_ATTR);
        insert[blotName] = blotValue;
        const attributes = StringMap.mapToObject(child.attributes());
        delete attributes[BLOT_VALUE_ATTR];
        insert["attributes"] = attributes;
        return {
          insert,
          attributes
        };
      } else {
        throw new Error("Unexpected element");
      }
    });
    return new Delta(deltaOps);
  }

  public static deltaToRoot(delta: Delta, doc: RichTextDocument): RichTextRootElement {
    const root = new RichTextRootElement(doc, ROOT_NAME, ROOT_ELEMENT_NAME);
    delta.ops.forEach((op) => {
      root.appendChild(DeltaConverter.convertInsertOp(op, root));
    });

    return root;
  }

  public static convertInsertOp(op: DeltaOperation, root: RichTextRootElement): RichTextNode {
    switch (typeof op.insert) {
      case "undefined":
        throw new Error("Document deltas should only have insert operations: " + JSON.stringify(op));
      case "string":
        return new RichTextString(root.document(), root, op.insert, StringMap.toStringMap(op.attributes));
      case "object":
        const keys = Object.keys(op.insert);
        if (keys.length !== 1) {
          throw new Error(
            "Invalid insert operation, the 'insert' object should have exactly 1 key: " +
            JSON.stringify(op));
        }
        const blotName = keys[0];
        const value: string = op.insert[blotName];

        const attributes = Object.assign({}, op.attributes);
        attributes[BLOT_VALUE_ATTR] = value;

        return new RichTextElement(
          root.document(),
          root,
          blotName,
          StringMap.toStringMap(attributes));
      default:
        throw new Error("Invalid insert value: " + JSON.stringify(op));
    }
  }

}
