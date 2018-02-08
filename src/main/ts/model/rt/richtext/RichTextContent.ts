import {RichTextElement} from "./RichTextElement";

export interface RichTextContent {

  document(): RichTextDocument;
  root(): RichTextRootElement;
  parent(): RichTextElement;
  path(): RichTextPath;

  attributes(): Map<string, any>;
  getAttribute(key: string): any;
  hasAttribute(key: string): boolean;

  type(): RichTextContentType;
  isA(type: RichTextContentType): boolean;
  isLeaf(): boolean;
}

import {RichTextDocument} from "./RichTextDocument";
import {RichTextRootElement} from "./RichTextRootElement";
import {RichTextContentType} from "./RichTextContentType";
import {RichTextPath} from "./RichTextLocation";
