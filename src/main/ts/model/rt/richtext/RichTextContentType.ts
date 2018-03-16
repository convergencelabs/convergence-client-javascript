export const RichTextContentTypes: {
  ELEMENT: "element";
  ROOT: "root";
  STRING: "string";
  STRING_FRAGMENT: "stringFragment";
} = {
  ELEMENT: "element",
  ROOT: "root",
  STRING: "string",
  STRING_FRAGMENT: "stringFragment"
};
Object.freeze(RichTextContentTypes);

export type RichTextContentType = "element" | "root" | "string" | "stringFragment";
