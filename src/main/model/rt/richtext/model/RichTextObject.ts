/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {RichTextElement} from "./RichTextElement";

/**
 * @hidden
 * @internal
 */
export class RichTextObject extends RichTextElement {

  constructor(document: RichTextDocument, parent: RichTextElement, name: string, attributes?: Map<string, any>) {
    super(document, parent, name, attributes);
  }

  public textContentLength(): number {
    return 1;
  }

  public type(): RichTextContentType {
    return RichTextContentType.OBJECT;
  }

  public isA(type: RichTextContentType): boolean {
    return type === RichTextContentType.OBJECT;
  }

  public toString(): string {
    return `[RichTextObject ` +
      `name: '${this.getName()}', ` +
      `children: [${this.getChildren().length}], ` +
      `attributes: ${JSON.stringify(StringMap.mapToObject(this.attributes()))}, ` +
      `path: ${JSON.stringify((this.path()))} ]`;
  }
}

import {RichTextDocument} from "./RichTextDocument";
import {RichTextContentType} from "./RichTextContentType";
import {StringMap} from "../../../../util";
