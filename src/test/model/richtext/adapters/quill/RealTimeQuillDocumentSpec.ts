/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
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
