import * as chai from "chai";
import {EventEmitter} from "../../../main/ts/util/EventEmitter";
import ExpectStatic = Chai.ExpectStatic;
import {deepClone} from "../../../main/ts/util/ObjectUtils";

const expect: ExpectStatic = chai.expect;

describe("ObjectUtils.deepClone", () => {

  it("Correctly deepClone a number", () => {
    const value: number = 5;
    const copy = deepClone(value);
    expect(copy).to.equal(value);
  });

  it("Correctly deepClone a string", () => {
    const value: string = "test";
    const copy = deepClone(value);
    expect(copy).to.equal(value);
  });

  it("Correctly deepClone a boolean", () => {
    const value: boolean = true;
    const copy = deepClone(value);
    expect(copy).to.equal(value);
  });

  it("Correctly deepClone null", () => {
    expect(deepClone(null)).to.be.null;
  });

  it("Correctly deepClone undefined", () => {
    expect(deepClone(undefined)).to.be.undefined;
  });

  it("Correctly deepClone a date", () => {
    const value: Date = new Date();
    const copy = deepClone(value);
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
    const copy = deepClone(value);
    expect(copy).to.not.equal(value);
    expect(copy).to.deep.equal(value);
  });

  it("Correctly deepClone an Array", () => {
    const value: any[] = [1, "2", null, false, new Date(), {a: "foo", b: null}];
    const copy = deepClone(value);
    expect(copy).to.not.equal(value);
    expect(copy).to.deep.equal(value);
  });

  it("Correctly deepClone an Set", () => {
    const value: Set<any> = new Set(["1", 2, null]);
    const copy = deepClone(value);
    expect(copy).to.not.equal(value);
    expect(copy.size).to.equal(3);
    expect(copy.has("1")).to.be.true;
    expect(copy.has(2)).to.be.true;
    expect(copy.has(null)).to.be.true;
  });

  it("Correctly deepClone an Map", () => {
    const value: Map<string, any> = new Map<string, any>();
    value.set("1", "1");
    value.set("2", 2);
    value.set("3", null);
    value.set("4", {foo: "bar"});
    const copy = deepClone(value);
    expect(copy).to.not.equal(value);
    expect(copy.size).to.equal(4);
    expect(copy.get("1")).to.equal("1");
    expect(copy.get("2")).to.equal(2);
    expect(copy.get("3")).to.equal(null);
    expect(copy.get("4")).to.deep.equal({foo: "bar"});
  });

  it("Disallow an unknown type", () => {
    expect(() => deepClone(new WeakSet())).to.throw(Error);
  });
});
