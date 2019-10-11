import {
  RangeRangeRelationship,
  RangeRelationshipUtil
} from "../../../../../main/ts/model/ot/util/RangeRelationshipUtil";
import * as chai from "chai";
import ExpectStatic = Chai.ExpectStatic;

const expect: ExpectStatic = chai.expect;

describe("RangeRelationshipUtil", () => {
  it("Correctly identify a precedes relationship ", () => {
    const rel: RangeRangeRelationship = RangeRelationshipUtil.getRangeRangeRelationship(0, 2, 3, 5);
    expect(rel).to.equal(RangeRangeRelationship.Precedes);
  });

  it("Correctly identify a preceded by relationship ", () => {
    const rel: RangeRangeRelationship = RangeRelationshipUtil.getRangeRangeRelationship(3, 5, 0, 2);
    expect(rel).to.equal(RangeRangeRelationship.PrecededBy);
  });

  it("Correctly identify a meets relationship ", () => {
    const rel: RangeRangeRelationship = RangeRelationshipUtil.getRangeRangeRelationship(0, 2, 2, 5);
    expect(rel).to.equal(RangeRangeRelationship.Meets);
  });

  it("Correctly identify a meet by relationship ", () => {
    const rel: RangeRangeRelationship = RangeRelationshipUtil.getRangeRangeRelationship(2, 5, 0, 2);
    expect(rel).to.equal(RangeRangeRelationship.MetBy);
  });

  it("Correctly identify a overlaps relationship ", () => {
    const rel: RangeRangeRelationship = RangeRelationshipUtil.getRangeRangeRelationship(0, 3, 2, 5);
    expect(rel).to.equal(RangeRangeRelationship.Overlaps);
  });

  it("Correctly identify a overlapped by relationship ", () => {
    const rel: RangeRangeRelationship = RangeRelationshipUtil.getRangeRangeRelationship(2, 5, 0, 3);
    expect(rel).to.equal(RangeRangeRelationship.OverlappedBy);
  });

  it("Correctly identify a starts relationship ", () => {
    const rel: RangeRangeRelationship = RangeRelationshipUtil.getRangeRangeRelationship(0, 3, 0, 5);
    expect(rel).to.equal(RangeRangeRelationship.Starts);
  });

  it("Correctly identify a started by relationship ", () => {
    const rel: RangeRangeRelationship = RangeRelationshipUtil.getRangeRangeRelationship(0, 5, 0, 3);
    expect(rel).to.equal(RangeRangeRelationship.StartedBy);
  });

  it("Correctly identify a contains relationship ", () => {
    const rel: RangeRangeRelationship = RangeRelationshipUtil.getRangeRangeRelationship(0, 5, 1, 4);
    expect(rel).to.equal(RangeRangeRelationship.Contains);
  });

  it("Correctly identify a contained by relationship ", () => {
    const rel: RangeRangeRelationship = RangeRelationshipUtil.getRangeRangeRelationship(1, 4, 0, 5);
    expect(rel).to.equal(RangeRangeRelationship.ContainedBy);
  });

  it("Correctly identify a finishes relationship ", () => {
    const rel: RangeRangeRelationship = RangeRelationshipUtil.getRangeRangeRelationship(3, 5, 0, 5);
    expect(rel).to.equal(RangeRangeRelationship.Finishes);
  });

  it("Correctly identify a finished by relationship ", () => {
    const rel: RangeRangeRelationship = RangeRelationshipUtil.getRangeRangeRelationship(0, 5, 3, 5);
    expect(rel).to.equal(RangeRangeRelationship.FinishedBy);
  });

  it("Correctly identify a equal to relationship ", () => {
    const rel: RangeRangeRelationship = RangeRelationshipUtil.getRangeRangeRelationship(0, 3, 0, 3);
    expect(rel).to.equal(RangeRangeRelationship.EqualTo);
  });
});
