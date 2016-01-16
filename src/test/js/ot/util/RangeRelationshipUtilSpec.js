var convergence = require("../../../../../build/convergence-client");
var expect = require('chai').expect;

describe('RangeRelationshipUtil', function () {
    var RangeRelationshipUtil = convergence.ot.RangeRelationshipUtil;
    var RangeRangeRelationship = convergence.ot.RangeRangeRelationship;

    it('Correctly identify a precedes relationship ', function () {
        var rel = RangeRelationshipUtil.getRangeRangeRelationship(0, 2, 3, 5);
        expect(rel).to.equal(RangeRangeRelationship.Precedes);
    });

    it('Correctly identify a preceded by relationship ', function () {
        var rel = RangeRelationshipUtil.getRangeRangeRelationship(3, 5, 0, 2);
        expect(rel).to.equal(RangeRangeRelationship.PrecededBy);
    });

    it('Correctly identify a meets relationship ', function () {
        var rel = RangeRelationshipUtil.getRangeRangeRelationship(0, 2, 2, 5);
        expect(rel).to.equal(RangeRangeRelationship.Meets);
    });

    it('Correctly identify a meet by relationship ', function () {
        var rel = RangeRelationshipUtil.getRangeRangeRelationship(2, 5, 0, 2);
        expect(rel).to.equal(RangeRangeRelationship.MetBy);
    });

    it('Correctly identify a overlaps relationship ', function () {
        var rel = RangeRelationshipUtil.getRangeRangeRelationship(0, 3, 2, 5);
        expect(rel).to.equal(RangeRangeRelationship.Overlaps);
    });

    it('Correctly identify a overlapped by relationship ', function () {
        var rel = RangeRelationshipUtil.getRangeRangeRelationship(2, 5, 0, 3);
        expect(rel).to.equal(RangeRangeRelationship.OverlappedBy);
    });

    it('Correctly identify a starts relationship ', function () {
        var rel = RangeRelationshipUtil.getRangeRangeRelationship(0, 3, 0, 5);
        expect(rel).to.equal(RangeRangeRelationship.Starts);
    });

    it('Correctly identify a started by relationship ', function () {
        var rel = RangeRelationshipUtil.getRangeRangeRelationship(0, 5, 0, 3);
        expect(rel).to.equal(RangeRangeRelationship.StartedBy);
    });

    it('Correctly identify a contains relationship ', function () {
        var rel = RangeRelationshipUtil.getRangeRangeRelationship(0, 5, 1, 4);
        expect(rel).to.equal(RangeRangeRelationship.Contains);
    });

    it('Correctly identify a contained by relationship ', function () {
        var rel = RangeRelationshipUtil.getRangeRangeRelationship(1, 4, 0, 5);
        expect(rel).to.equal(RangeRangeRelationship.ContainedBy);
    });

    it('Correctly identify a finishes relationship ', function () {
        var rel = RangeRelationshipUtil.getRangeRangeRelationship(3, 5, 0, 5);
        expect(rel).to.equal(RangeRangeRelationship.Finishes);
    });

    it('Correctly identify a finished by relationship ', function () {
        var rel = RangeRelationshipUtil.getRangeRangeRelationship(0, 5, 3, 5);
        expect(rel).to.equal(RangeRangeRelationship.FinishedBy);
    });

    it('Correctly identify a equal to relationship ', function () {
        var rel = RangeRelationshipUtil.getRangeRangeRelationship(0, 3, 0, 3);
        expect(rel).to.equal(RangeRangeRelationship.EqualTo);
    });
});
