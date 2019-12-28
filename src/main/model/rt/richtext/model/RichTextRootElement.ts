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

import {RichTextElement} from "./RichTextElement";
import {RichTextDocument} from "./RichTextDocument";
import {RichTextContentType} from "./RichTextContentType";
import {RichTextLocation, RichTextPath} from "./RichTextLocation";
import {StringMap} from "../../../../util/StringMap";

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

  public location(): RichTextLocation | null {
    return RichTextLocation.ofRoot(this);
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
