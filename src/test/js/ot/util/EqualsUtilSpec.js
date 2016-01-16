var convergence = require("../../../../../build/convergence-client");
var expect = require('chai').expect;

describe('EqualUtil', function () {
    var EqualsUtil = convergence.ot.EqualsUtil;

    it('NaN and NaN are equal', function () {
        expect(EqualsUtil.deepEquals(NaN, NaN)).to.be.true;
    });

    it('NaN and non NaN are unequal', function () {
        expect(EqualsUtil.deepEquals(NaN, 0)).to.be.false;
    });

    it('equal booleans are equal', function () {
        expect(EqualsUtil.deepEquals(true, true)).to.be.true;
    });

    it('unequal booleans are unequal', function () {
        expect(EqualsUtil.deepEquals(true, false)).to.be.false;
    });

    it('equal numbers are equal', function () {
        expect(EqualsUtil.deepEquals(4, 4)).to.be.true;
    });

    it('unequal numbers are unequal', function () {
        expect(EqualsUtil.deepEquals(4, 5)).to.be.false;
    });

    it('equal strings are equal', function () {
        expect(EqualsUtil.deepEquals("foo", "foo")).to.be.true;
    });

    it('unequal numbers are unequal', function () {
        expect(EqualsUtil.deepEquals("foo", "bar")).to.be.false;
    });

    it('null is equal to null', function () {
        expect(EqualsUtil.deepEquals(null, null)).to.be.true;
    });

    it('null is not equal to non null values', function () {
        expect(EqualsUtil.deepEquals(null, 2)).to.be.false;
    });

    it('equal arrays are equal', function () {
        var x = [1, "2", false, null];
        var y = [1, "2", false, null];
        expect(EqualsUtil.deepEquals(x, y)).to.be.true;
    });

    it('unequal arrays are unequal', function () {
        var x = [1, "2", false, null];
        var y = [1, "2", true, null];
        expect(EqualsUtil.deepEquals(x, y)).to.be.false;
    });

    it('Equal complex objects are equal', function () {
        var x = {
            a: "foo",
            b: false,
            c: {
                x: 4
            },
            d: null,
            e: [1, "2", true, null]
        };

        var y = {
            a: "foo",
            b: false,
            c: {
                x: 4
            },
            d: null,
            e: [1, "2", true, null]
        };

        expect(EqualsUtil.deepEquals(x, y)).to.be.true
    });

    it('Unequal complex objects are unequal', function () {
        var x = {
            a: "foo",
            b: false,
            c: {
                x: 3
            },
            d: null,
            e: [1, "2", true, null]
        };

        var y = {
            a: "foo",
            b: false,
            c: {
                x: 4
            },
            d: null,
            e: [1, "2", true, null]
        };

        expect(EqualsUtil.deepEquals(x, y)).to.be.false
    });
});
