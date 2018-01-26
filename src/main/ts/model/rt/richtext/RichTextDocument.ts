import {StringMapLike} from "../../../util/StringMap";
import {RichTextLocation, RichTextLocationLike} from "./RichTextLocation";
import {RichTextNode} from "./RichTextNode";
import {EventEmitter} from "../../../util/EventEmitter";

export class RichTextDocument extends EventEmitter {
  private _attributes: Map<string, any>;
  private _roots: Map<string, RichTextNode>;

  constructor() {
    super();

    this._roots = new Map<string, RichTextNode>();
    this._attributes = new Map<string, any>();
  }

  // Basic Text Manipulation
  public insertText(text: string, location: RichTextLocationLike, attributes?: StringMapLike): void {

    // todo
  }

  public removeText(text: string, location: RichTextLocationLike, length: number): void {
    // todo
  }

  public setAttributes(location: RichTextLocationLike, length: number, attributes: StringMapLike): void {
    // todo
  }

  public setAttribute(location: RichTextLocationLike, length: number, key: string, value: any): void {
    // todo
  }

  public removeAttribute(location: RichTextLocationLike, length: number, key: string): void {
    // todo
  }

  public addRoot(name: string, root: RichTextNode): void {
    this._roots.set(name, root);
  }

  public getRoot(name: string): RichTextNode {
    return this._roots.get(name);
  }

  public removeRoot(name: string): RichTextNode {
    const root: RichTextNode =  this._roots.get(name);
    if (root) {
      this._roots.delete(name);
    }

    return root;
  }
}
