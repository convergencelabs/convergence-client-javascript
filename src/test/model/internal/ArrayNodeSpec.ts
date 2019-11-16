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
import {createStubInstance} from "sinon";
import {TestIdGenerator} from "../TestIdGenerator";
import {DataValueFactory} from "../../../main/model/DataValueFactory";
import {ArrayValue} from "../../../main/model/dataValue";
import {ArrayNode} from "../../../main/model/internal/ArrayNode";
import {Model} from "../../../main/model/internal/Model";
import {ConvergenceSession} from "../../../main";

describe("ArrayNode", () => {
  const gen: TestIdGenerator = new TestIdGenerator();

  const dataValueFactory: DataValueFactory = new DataValueFactory(() => {
    return gen.id();
  });

  const session = createStubInstance(ConvergenceSession) as any as ConvergenceSession;
  const model = createStubInstance(Model) as any as Model;
  const primitiveValue: any[] = ["A", "B", "C"];

  const arrayValue: ArrayValue = dataValueFactory.createDataValue(primitiveValue) as ArrayValue;

  it("data() is correct after creation", () => {
    const arrayNode: ArrayNode = createArrayNode(arrayValue);
    expect(arrayNode.data()).to.deep.equal(primitiveValue);
  });

  it("dataValue() is correct after creation", () => {
    const arrayNode: ArrayNode = createArrayNode(arrayValue);
    expect(arrayNode.dataValue()).to.deep.equal(arrayValue);
  });

  it("length() is correct after creation", () => {
    const arrayNode: ArrayNode = createArrayNode(arrayValue);
    expect(arrayNode.length()).to.deep.equal(arrayValue.children.length);
  });

  it("get() returns correct value", () => {
    const arrayNode: ArrayNode = createArrayNode(arrayValue);
    expect(arrayNode.get(1).data()).to.equal(primitiveValue[1]);
  });

  it("get() disallows negative index.", () => {
    const arrayNode: ArrayNode = createArrayNode(arrayValue);
    expect(() => arrayNode.get(-1)).to.throw(Error);
  });

  it("get() disallows an index equal to the the length.", () => {
    const arrayNode: ArrayNode = createArrayNode(arrayValue);
    expect(() => arrayNode.get(3)).to.throw(Error);
  });

  it("get() disallows an index greater than the length.", () => {
    const arrayNode: ArrayNode = createArrayNode(arrayValue);
    expect(() => arrayNode.get(4)).to.throw(Error);
  });

  it("insert() allows an index of 0.", () => {
    const arrayNode: ArrayNode = createArrayNode(arrayValue);
    arrayNode.insert(0, true);
    expect(arrayNode.length()).to.equal(4);
    expect(arrayNode.get(0).data()).to.equal(true);
  });

  it("insert() allows an index equal to the length.", () => {
    const arrayNode: ArrayNode = createArrayNode(arrayValue);
    arrayNode.insert(3, true);
    expect(arrayNode.length()).to.equal(4);
    expect(arrayNode.get(3).data()).to.equal(true);
  });

  it("insert() disallows a negative index.", () => {
    const arrayNode: ArrayNode = createArrayNode(arrayValue);
    expect(() => arrayNode.insert(-1, true)).to.throw(Error);
  });

  it("insert() disallows an index greater than the length.", () => {
    const arrayNode: ArrayNode = createArrayNode(arrayValue);
    expect(() => arrayNode.insert(4, true)).to.throw(Error);
  });

  it("remove() allows an index of 0.", () => {
    const arrayNode: ArrayNode = createArrayNode(arrayValue);
    arrayNode.remove(0);
    expect(arrayNode.length()).to.equal(2);
    expect(arrayNode.get(0).data()).to.equal(primitiveValue[1]);
  });

  it("remove() disallows an index equal to the length.", () => {
    const arrayNode: ArrayNode = createArrayNode(arrayValue);
    expect(() => arrayNode.remove(3)).to.throw(Error);
  });

  it("remove() disallows a negative index.", () => {
    const arrayNode: ArrayNode = createArrayNode(arrayValue);
    expect(() => arrayNode.remove(-1)).to.throw(Error);
  });

  it("remove() disallows an index greater than the length.", () => {
    const arrayNode: ArrayNode = createArrayNode(arrayValue);
    expect(() => arrayNode.remove(4)).to.throw(Error);
  });

  it("set() allows an index of 0.", () => {
    const arrayNode: ArrayNode = createArrayNode(arrayValue);
    arrayNode.set(0, true);
    expect(arrayNode.length()).to.equal(3);
    expect(arrayNode.get(0).data()).to.equal(true);
  });

  it("set() disallows an index equal to the length.", () => {
    const arrayNode: ArrayNode = createArrayNode(arrayValue);
    expect(() => arrayNode.set(3, true)).to.throw(Error);
  });

  it("set() disallows a negative index.", () => {
    const arrayNode: ArrayNode = createArrayNode(arrayValue);
    expect(() => arrayNode.set(-1, false)).to.throw(Error);
  });

  it("set() disallows an index greater than the length.", () => {
    const arrayNode: ArrayNode = createArrayNode(arrayValue);
    expect(() => arrayNode.set(4, false)).to.throw(Error);
  });

  function createArrayNode(value: ArrayValue): ArrayNode {
    return new ArrayNode(value, () => [], model, session, dataValueFactory);
  }
});
