/**
 * @hidden
 * @internal
 */
export class RichTextDocument {
  private _attributes: Map<string, any>;
  private _roots: Map<string, RichTextRootElement>;
  private _mutator: RichTextMutator;

  constructor() {
    this._mutator = new RichTextMutator(this);
    this._roots = new Map<string, RichTextRootElement>();
    this._attributes = new Map<string, any>();
  }

  // // Basic Text Manipulation
  public insertText(location: RichTextLocation, text: string, attributes?: StringMapLike): void {
    this._mutator.insertText(location, text, StringMap.toStringMap(attributes));
  }

  public insert(location: RichTextLocation, content: RichTextNode): void {
    this._mutator.insert(location, content);
  }

  public removeRange(range: RichTextRange): void {
    this._mutator.removeRange(range);
  }

  public setAttribute(range: RichTextRange, key: string, value: any): void {
    this._mutator.setAttribute(range, key, value);
  }

  public removeAttribute(range: RichTextRange, key: string): void {
    throw new Error("not implemented");
  }

  public getRoots(): Map<string, RichTextRootElement> {
    return new Map(this._roots.entries());
  }

  public getRoot(name: string): RichTextRootElement {
    return this._roots.get(name);
  }

  public hasRoot(name: string): boolean {
    return this._roots.has(name);
  }

  public addRoot(root: RichTextRootElement): void {
    if (Validation.isNotSet(root)) {
      throw new ConvergenceError("Can not add a null or undefined root");
    }

    const rootName = root.getRootName();

    if (this.hasRoot(rootName)) {
      throw new ConvergenceError(`The document already has a root named '${rootName}'. Use replaceRoot().`);
    }

    this._roots.set(rootName, root);
  }

  public replaceRoot(root: RichTextRootElement): void {
    if (Validation.isNotSet(root)) {
      throw new ConvergenceError("Can not add a null or undefined root");
    }

    const rootName = root.getRootName();

    if (!this.hasRoot(rootName)) {
      throw new ConvergenceError(`The document does not have a root named '${rootName}'. Use addRoot().`);
    }

    this._roots.set(rootName, root);
  }

  public removeRoot(name: string): RichTextRootElement {
    if (Validation.isNotSet(name)) {
      throw new ConvergenceError(`The root name was not specified: ${name}`);
    }

    const root: RichTextRootElement = this._roots.get(name);
    if (root) {
      this._roots.delete(name);
    }

    return root;
  }
}

import {RichTextRootElement} from "./RichTextRootElement";
import {RichTextMutator} from "./RichTextMutator";
import {RichTextLocation} from "./RichTextLocation";
import {RichTextRange} from "./RichTextRange";
import {RichTextNode} from "./RichTextNode";
import {
  StringMapLike,
  StringMap,
  ConvergenceError} from "../../../../util";
import { Validation } from "../../../../util/Validation";
