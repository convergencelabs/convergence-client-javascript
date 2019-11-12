/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {DocumentData} from "./TestDocumentCreator";

export const TWO_PARAGRAPHS: DocumentData = {
  main: {name: "doc", children: [
    {type: "element", name: "paragraph", children: [
      {type: "string", data: "Here is some text. "},
      {type: "string", data: "This text is bold. ", attributes: {bold: true}},
      {type: "string", data: "But this text is not."}
    ]},
    {type: "element", name: "paragraph", children: [
      {type: "string", data: "This is another paragraph."}
    ]}
  ]}
};
