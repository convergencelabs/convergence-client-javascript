/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "LICENSE" and
 * "LICENSE.LGPL" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

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
import {ConvergenceError} from "../../../../util";
import {StringMapLike, StringMap} from "../../../../util/StringMap";
import { Validation } from "../../../../util/Validation";
