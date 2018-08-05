import {DocumentData} from "./TestDocumentCreator";

export const TWO_PARAGRAPHS_WITH_OBJECT: DocumentData = {
  main: {name: "doc", children: [
      {type: "element", name: "paragraph", children: [
          {type: "string", data: "012"},
          {type: "string", data: "3", attributes: {bold: true}},
          {type: "string", data: "45"},
          {type: "object", name: "image", children: []},
          {type: "string", data: "789"}
        ]},
      {type: "element", name: "paragraph", children: [
          {type: "string", data: "abcdef"}
        ]}
    ]}
};
