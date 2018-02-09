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

  // // Basic Text Manipulation
  // public insertText(text: string, location: RichTextLocationData, attributes?: StringMapLike): void {
  //   // todo
  // }
  //
  // public removeText(text: string, location: RichTextLocationData, length: number): void {
  //   // todo
  // }
  //
  // public setAttributes(location: RichTextLocationData, length: number, attributes: StringMapLike): void {
  //   // todo
  // }
  //
  // public setAttribute(location: RichTextLocationData, length: number, key: string, value: any): void {
  //   // todo
  // }
  //
  // public removeAttributes(location: RichTextLocationData, length: number, key: string[]): void {
  //   // todo
  // }
  //
  // public removeAttribute(location: RichTextLocationData, length: number, key: string): void {
  //   // todo
  // }

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

    if (Validation.isSet(this._roots.get(rootName))) {
      throw new ConvergenceError(`A root with the same name already exists: ${root.getRootName()}`);
    }

    this._roots.set(rootName, root);
  }

  public removeRoot(name: string): RichTextRootElement {
    if (Validation.isNotSet(name)) {
      throw new ConvergenceError(`The root name was not specified: ${name}`);
    }

    const root: RichTextRootElement =  this._roots.get(name);
    if (root) {
      this._roots.delete(name);
    }

    return root;
  }
}

import {RichTextRootElement} from "./RichTextRootElement";
import {RichTextMutator} from "./RichTextMutator";
import {Validation} from "../../../util/Validation";
import {ConvergenceError} from "../../../util/ConvergenceError";
