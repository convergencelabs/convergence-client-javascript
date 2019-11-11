import * as Delta from "quill-delta";
import {QuillDeltaConverter} from "../../../../../main/model/rt/richtext/adapters/quill";
import {RichTextRootElement} from "../../../../../main/model/rt/richtext/model/RichTextRootElement";
import {RichTextDocument} from "../../../../../main/model/rt/richtext/model/RichTextDocument";

export const GANDALF = new Delta([
  {insert: "Gandalf", attributes: {bold: true}},
  {insert: " the "},
  {insert: "Grey", attributes: {color: "#ccc"}}
]);

export function createDoc(delta: Delta): RichTextDocument {
  const doc: RichTextDocument = new RichTextDocument();
  const root: RichTextRootElement = QuillDeltaConverter.deltaToRoot(delta, doc);
  doc.addRoot(root);
  return doc;
}
