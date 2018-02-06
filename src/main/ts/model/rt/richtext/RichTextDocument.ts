import {EventEmitter} from "../../../util/EventEmitter";

export class RichTextDocument extends EventEmitter {
  private _attributes: Map<string, any>;
  private _roots: Map<string, RichTextRootElement>;
  private _mutator: RichTextMutator;

  constructor() {
    super();
    this._mutator = new RichTextMutator(this);
    this._roots = new Map<string, RichTextRootElement>();
    this._attributes = new Map<string, any>();
  }

  public getLocation(location: RichTextLocationData, root?: string): RichTextLocation {
    return new RichTextLocation(location, this, this.getRoot(root));
  }

  // Basic Text Manipulation
  public insertText(text: string, location: RichTextLocationData, attributes?: StringMapLike): void {
    // todo
  }

  public removeText(text: string, location: RichTextLocationData, length: number): void {
    // todo
  }

  public setAttributes(location: RichTextLocationData, length: number, attributes: StringMapLike): void {
    // todo
  }

  public setAttribute(location: RichTextLocationData, length: number, key: string, value: any): void {
    // todo
  }

  public removeAttributes(location: RichTextLocationData, length: number, key: string[]): void {
    // todo
  }

  public removeAttribute(location: RichTextLocationData, length: number, key: string): void {
    // todo
  }

  public addRoot(root: RichTextRootElement): void {
    this._roots.set(root.getRootName(), root);
  }

  public getRoot(name: string): RichTextRootElement {
    return this._roots.get(name);
  }

  public removeRoot(name: string): RichTextRootElement {
    const root: RichTextRootElement =  this._roots.get(name);
    if (root) {
      this._roots.delete(name);
    }

    return root;
  }
}

import {RichTextRootElement} from "./RichTextRootElement";
import {StringMapLike} from "../../../util/StringMap";
import {RichTextLocation, RichTextLocationData} from "./RichTextLocation";
import {RichTextMutator} from "./RichTextMutator";
