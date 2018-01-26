import {RichTextLocation} from "./RichTextLocation";

export interface RichTextRange {
  start: RichTextLocation;
  end: RichTextLocation;
  length: number;
}
