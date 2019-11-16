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

import {expect} from "chai";
import {createDoc, GANDALF} from "./deltas";
import {RealTimeQuillDocument} from "../../../../../main/model/rt/richtext/adapters/quill";
// import * as Delta from "quill-delta";

describe("RealTimeQuillDocument", () => {
  describe("#getValue", () => {
    it("Returns correct delta.", () => {
      const quillDoc = new RealTimeQuillDocument(createDoc(GANDALF));
      expect(quillDoc.getValue().ops).to.deep.eq(GANDALF.ops);
    });
  });

  // describe("#updateContents", () => {
  //   it("Returns correct delta.", () => {
  //     const quillDoc = new RealTimeQuillDocument(createDoc(GANDALF));
  //     const op: any = {
  //       insert: "foo",
  //       attributes: {}
  //     };
  //     quillDoc.updateContents(new Delta([op]));
  //     expect(quillDoc.getValue().ops).to.deep.eq([op].concat(GANDALF.ops));
  //   });
  // });
});
