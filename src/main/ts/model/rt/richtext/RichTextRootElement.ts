import {RichTextElement} from "./RichTextElement";

export class RichTextRootElement extends RichTextElement {
  private _rootName: string;

  constructor(document: RichTextDocument,
              rootName: string,
              name: string,
              attributes?: Map<string, any>) {
    super(null, document, name, attributes);
    this._rootName = rootName;
  }

  public getRootName(): string {
    return this._rootName;
  }

  public type(): RichTextContentType {
    return RichTextContentTypes.ROOT;
  }

  public isA(type: RichTextContentType): boolean {
    return type === RichTextContentTypes.ROOT;
  }

  public root(): RichTextRootElement {
    return this;
  }
}

import {RichTextDocument} from "./RichTextDocument";
import {RichTextContentType, RichTextContentTypes} from "./RichTextContentType";
