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

import {expect} from "chai";
import {RichTextLocation, RichTextRange} from "../../../main/model/rt/richtext/model/";
import {TestDocumentCreator} from "./documents/TestDocumentCreator";
import {TWO_PARAGRAPHS_WITH_OBJECT} from "./documents/two_paragraphs_with_object";
import {RichTextLocationTransformer} from "../../../main/model/rt/richtext/model/RichTextLocationTransformer";

describe("RichTextLocationTransformer", () => {
  describe("transformRemove", () => {
    it("getting offset location", () => {
      const document = TestDocumentCreator.createDocument(TWO_PARAGRAPHS_WITH_OBJECT);
      const root = document.getRoot("main");

      const start = RichTextLocation.ofTextOffset(root, 2);
      const end = RichTextLocation.ofTextOffset(root, 5);

      const range = new RichTextRange(start, end);

      const location = RichTextLocation.ofTextOffset(root, 10);
      const xformed = RichTextLocationTransformer.transform(location, range);
    });
  });
});
