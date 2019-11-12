/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {RichTextElement} from "./RichTextElement";
import {RichTextDocument} from "./RichTextDocument";
import {RichTextContentType} from "./RichTextContentType";
import {RichTextPath} from "./RichTextLocation";
import {StringMap} from "../../../../util";

/**
 * @hidden
 * @internal
 */
export class RichTextRootElement extends RichTextElement {
  private readonly _rootName: string;

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
    return RichTextContentType.ROOT;
  }

  public isA(type: RichTextContentType): boolean {
    return type === RichTextContentType.ROOT;
  }

  public root(): RichTextRootElement {
    return this;
  }

  public toString(): string {
    return `[RichTextRootElement ` +
      `rootName: '${this._rootName}', ` +
      `name: '${this.getName()}', ` +
      `children: [${this.childCount()}], ` +
      `attributes: ${JSON.stringify(StringMap.mapToObject(this.attributes()))}, ` +
      `path: ${JSON.stringify((this.path()))} ]`;
  }
}
