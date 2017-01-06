import * as chai from "chai";
import {EventEmitter} from "../../../main/ts/util/EventEmitter";
import ExpectStatic = Chai.ExpectStatic;
import {Immutable} from "../../../main/ts/util/Immutable";

const expect: ExpectStatic = chai.expect;

describe("Immutable", () => {

  it("Correctly deepClone a number", () => {
    const value: number = 5;
    const copy = Immutable.deepClone(value);
    expect(copy).to.equal(value);
  });

  it("Correctly deepClone a string", () => {
    const value: string = "test";
    const copy = Immutable.deepClone(value);
    expect(copy).to.equal(value);
  });

  it("Correctly deepClone a boolean", () => {
    const value: boolean = true;
    const copy = Immutable.deepClone(value);
    expect(copy).to.equal(value);
  });

  it("Correctly deepClone null", () => {
    expect(Immutable.deepClone(null)).to.be.null;
  });

  it("Correctly deepClone undefined", () => {
    expect(Immutable.deepClone(undefined)).to.be.undefined;
  });

  it("Correctly deepClone a date", () => {
    const value: Date = new Date();
    const copy = Immutable.deepClone(value);
    expect(copy).to.not.equal(value);
    expect(copy.getTime()).to.equal(value.getTime());
  });

  it("Correctly deepClone an Object", () => {
    const value: any = {
      number: 4,
      null: null,
      string: "x",
      object: {nested: 1},
      array: [1, "2", null, false, new Date()]
    };
    const copy = Immutable.deepClone(value);
    expect(copy).to.not.equal(value);
    expect(copy).to.deep.equal(value);
  });

  it("Correctly deepClone an Array", () => {
    const value: any[] = [1, "2", null, false, new Date(), {a: "foo", b: null}];
    const copy = Immutable.deepClone(value);
    expect(copy).to.not.equal(value);
    expect(copy).to.deep.equal(value);
  });

  it("Disallow an unknown type", () => {
    expect(() => Immutable.deepClone(new Map())).to.throw(Error);
  });
});
