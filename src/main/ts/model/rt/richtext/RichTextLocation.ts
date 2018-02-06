export type RichTextPath = number[];

export interface RichTextPosition {
  path: RichTextPath;
  index: number;
}

export class RichTextLocation {
  private _document: RichTextDocument;
  private _root: RichTextElement;

  constructor(location: RichTextLocationData, document: RichTextDocument, root: RichTextElement) {
    // todo
  }

  public textOffset(): number {
    return null;
  }

  public position(): RichTextPosition {
    return null;
  }

  public getNode(): RichTextNode {
    return null;
  }

  public getIndex(): number {
    return 0;
  }

  public getNearestCommonAncestor(other: RichTextLocation): RichTextElement {
    return null;
  }
}

export type RichTextLocationData = number | RichTextPosition | RichTextLocation;

import {RichTextDocument} from "./RichTextDocument";
import {RichTextElement} from "./RichTextElement";
import {RichTextNode} from "./RichTextNode";
