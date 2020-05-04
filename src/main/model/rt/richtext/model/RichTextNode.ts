/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "COPYING" and
 * "COPYING.LESSER" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

import {RichTextContent} from "./RichTextContent";
import {RichTextElement} from "./RichTextElement";
import {RichTextRootElement} from "./RichTextRootElement";
import {RichTextDocument} from "./RichTextDocument";
import {RichTextLocation, RichTextPath} from "./RichTextLocation";
import {RichTextContentType} from "./RichTextContentType";
import {ConvergenceError} from "../../../../util";
import {Validation} from "../../../../util/Validation";

/**
 * @hidden
 * @internal
 */
export abstract class RichTextNode implements RichTextContent {
  private _parent: RichTextElement | null;
  private readonly _document: RichTextDocument;
  private readonly _attributes: Map<string, any>;

  protected constructor(document: RichTextDocument, parent: RichTextElement | null, attributes?: Map<string, any>) {
    if (Validation.isNotSet(document)) {
      throw new ConvergenceError("The document must be set.", "rich-text-node-document-not-set");
    }

    this._parent = parent;
    this._document = document;
    this._attributes = attributes || new Map<string, any>();
  }

  public parent(): RichTextElement | null {
    return this._parent;
  }

  public _setParent(parent: RichTextElement): void {
    this._parent = parent;
  }

  public index(): number {
    if (this._parent !== null) {
      const pos = this._parent.getChildIndex(this);
      return pos;
    } else {
      return -1;
    }
  }

  public removeFromParent(): void {
    if (this._parent !== null) {
      this._parent.removeChild(this.index());
      this._setParent(null);
    }
  }

  public path(): RichTextPath | null {
    if (Validation.isNotSet(this._parent)) {
      return null;
    }

    const index = this.index();
    if (index < 0) {
      // We don't actually exist in our parent element.
      // todo this should be an error.
      return null;
    }

    const path = this._parent.path();
    if (path === null) {
      // We don't have a parent chain that goes all the way up to a
      // root element, therefore we have no path.
      return null;
    }

    path.push(index);

    return path;
  }

  public location(): RichTextLocation | null {
    if (this._parent !== null) {
      return RichTextLocation.ofPath(this.parent().root(), this.path());
    } else {
      return null;
    }
  }

  public root(): RichTextRootElement | null {
    if (!Validation.isSet(this._parent)) {
      return null;
    } else {
      return this._parent.root();
    }
  }

  public hasParent(): boolean {
    return Validation.isSet(this._parent);
  }

  public hasNextSibling(): boolean {
    if (!this.hasParent()) {
      return false;
    } else {
      const nextIndex = this.index() + 1;
      return nextIndex < this._parent.childCount();
    }
  }

  public nextSibling(): RichTextNode {
    if (!this.hasParent()) {
      return null;
    }

    const nextIndex = this.index() + 1;
    if (nextIndex >= this._parent.childCount()) {
      return null;
    }

    return this._parent.getChild(nextIndex);
  }

  public hasPreviousSibling(): boolean {
    if (!this.hasParent()) {
      return false;
    } else {
      const index = this.index();
      return index > 0;
    }
  }

  public previousSibling(): RichTextNode {
    if (!this.hasParent()) {
      return null;
    }

    const prevIndex = this.index() - 1;
    if (prevIndex < 0) {
      return null;
    }

    return this._parent.getChild(prevIndex);
  }

  public document(): RichTextDocument {
    return this._document;
  }

  public attributes(): Map<string, any> {
    return new Map(this._attributes);
  }

  public setAttribute(key: string, value: any): void {
    this._attributes.set(key, value);
  }

  public hasAttribute(key: string): boolean {
    return this._attributes.get(key) !== undefined;
  }

  public getAttribute(key: string): any {
    return this._attributes.get(key);
  }

  public removeAttribute(key: string): void {
    this._attributes.delete(key);
  }

  public abstract textContentLength(): number;

  public abstract type(): RichTextContentType;

  public abstract isA(type: RichTextContentType): boolean;

  public abstract isLeaf(): boolean;
}
