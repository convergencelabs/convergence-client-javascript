/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {RichTextLocation} from "./RichTextLocation";
import {RichTextOperation} from "../operations/RichTextOperation";
import {RichTextRange} from "./RichTextRange";

/**
 * @internal
 * @hidden
 */
export class RichTextLocationTransformer {

  public static transform(location: RichTextLocation, operation: RichTextOperation): RichTextLocation {
    return null;
  }

  public static transformRemove(location: RichTextLocation, range: RichTextRange): RichTextLocation {
    return location;
  }
}
