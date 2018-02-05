import {RichTextDocument} from "./RichTextDocument";
import {RichTextNode} from "./RichTextNode";
import {RichTextPath} from "./RichTextLocation";
import {ConvergenceError} from "../../../util/ConvergenceError";
import {RichTextElement} from "./RichTextElement";

export class RichTextRootElement extends RichTextElement {
  private _rootName: string;

  constructor(parent: RichTextElement,
              document: RichTextDocument,
              name: string,
              rootName: string,
              attributes?: Map<string, any>) {
    super(parent, document, name, attributes);
    this._rootName = rootName;
  }

  public getRootName(): string {
    return this._rootName;
  }
}
