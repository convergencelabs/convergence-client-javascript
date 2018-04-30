import * as Delta from "quill-delta";
import {DeltaConverter} from "../../../../../../main/ts/model/rt/richtext/adapters/quill";
import {RichTextRootElement} from "../../../../../../main/ts/model/rt/richtext/model/RichTextRootElement";
import {RichTextDocument} from "../../../../../../main/ts/model/rt/richtext/model/RichTextDocument";

export const GANDALF = new Delta([
  {insert: "Gandalf", attributes: {bold: true}},
  {insert: " the "},
  {insert: "Grey", attributes: {color: "#ccc"}}
]);

export function createDoc(delta: Delta): RichTextDocument {
  const doc: RichTextDocument = new RichTextDocument();
  const root: RichTextRootElement = DeltaConverter.deltaToRoot(delta, doc);
  doc.addRoot(root);
  return doc;
}
