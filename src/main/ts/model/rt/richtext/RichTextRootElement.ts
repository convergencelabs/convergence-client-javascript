import {RichTextElement} from "./RichTextElement";
import {RichTextDocument} from "./RichTextDocument";
import {RichTextContentType, RichTextContentTypes} from "./RichTextContentType";
import {RichTextPath} from "./RichTextLocation";
import {StringMap} from "../../../util/StringMap";

export class RichTextRootElement extends RichTextElement {
  private _rootName: string;

  constructor(document: RichTextDocument,
              rootName: string,
              name: string,
              attributes?: Map<string, any>) {
    super(document, null, name, attributes);
    this._rootName = rootName;
  }

  public getRootName(): string {
    return this._rootName;
  }

  public path(): RichTextPath {
    return [];
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

  public toString(): string {
    return `[RichTextRootElement ` +
      `rootName: '${this._rootName}', ` +
      `name: '${this._name}', ` +
      `children: [${this._children.length}], ` +
      `attributes: ${JSON.stringify(StringMap.mapToObject(this.attributes()))} ]`;
  }
}
