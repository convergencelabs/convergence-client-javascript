/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

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
