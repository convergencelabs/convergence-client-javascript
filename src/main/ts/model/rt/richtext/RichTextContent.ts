import {RichTextDocument} from "./RichTextDocument";
import {RichTextLocation} from "./RichTextLocation";
import {RichTextRootElement} from "./RichTextRootElement";

export interface RichTextContent {
  root(): RichTextRootElement;
  document(): RichTextDocument;
  location(): RichTextLocation;

  attributes(): Map<string, any>;
  getAttribute(key: string): any;
  hasAttribute(key: string): boolean;
}
