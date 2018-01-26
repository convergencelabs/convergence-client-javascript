import {RichTextDocument} from "./RichTextDocument";
import {RichTextElement} from "./RichTextElement";

export type RichTextPath = number[];

export interface RichTextPosition {
  path: RichTextPath;
  offset: number;
}

export class RichTextLocation {
  private _document: RichTextDocument;
  private _root: RichTextElement;

  constructor(document: RichTextDocument, root: RichTextElement, location: RichTextLocationLike) {

  }

  public textOffset(): number {
    return null;
  }

  public position(): RichTextPosition {
    return null;
  }
}

export type RichTextLocationLike = number | RichTextLocation;
