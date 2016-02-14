var RangeRelationshipUtil = (function () {
    function RangeRelationshipUtil() {
    }
    RangeRelationshipUtil.getRangeIndexRelationship = function (rStart, rEnd, index) {
        if (index < rStart) {
            return RangeIndexRelationship.Before;
        }
        else if (index > rEnd) {
            return RangeIndexRelationship.After;
        }
        else if (index === rStart) {
            return RangeIndexRelationship.Start;
        }
        else if (index === rEnd) {
            return RangeIndexRelationship.End;
        }
        else {
            return RangeIndexRelationship.Within;
        }
    };
    RangeRelationshipUtil.getRangeRangeRelationship = function (sStart, sEnd, cStart, cEnd) {
        if (sStart === cStart) {
            if (sEnd === cEnd) {
                return RangeRangeRelationship.EqualTo;
            }
            else if (cEnd > sEnd) {
                return RangeRangeRelationship.Starts;
            }
            else {
                return RangeRangeRelationship.StartedBy;
            }
        }
        else if (sStart > cStart) {
            if (sStart > cEnd) {
                return RangeRangeRelationship.PrecededBy;
            }
            else if (cEnd === sEnd) {
                return RangeRangeRelationship.Finishes;
            }
            else if (sEnd < cEnd) {
                return RangeRangeRelationship.ContainedBy;
            }
            else if (sStart === cEnd) {
                return RangeRangeRelationship.MetBy;
            }
            else {
                return RangeRangeRelationship.OverlappedBy;
            }
        }
        else {
            if (sEnd < cStart) {
                return RangeRangeRelationship.Precedes;
            }
            else if (cEnd === sEnd) {
                return RangeRangeRelationship.FinishedBy;
            }
            else if (sEnd > cEnd) {
                return RangeRangeRelationship.Contains;
            }
            else if (sEnd === cStart) {
                return RangeRangeRelationship.Meets;
            }
            else {
                return RangeRangeRelationship.Overlaps;
            }
        }
    };
    return RangeRelationshipUtil;
})();
exports.RangeRelationshipUtil = RangeRelationshipUtil;
(function (RangeIndexRelationship) {
    RangeIndexRelationship[RangeIndexRelationship["Before"] = 0] = "Before";
    RangeIndexRelationship[RangeIndexRelationship["Start"] = 1] = "Start";
    RangeIndexRelationship[RangeIndexRelationship["Within"] = 2] = "Within";
    RangeIndexRelationship[RangeIndexRelationship["End"] = 3] = "End";
    RangeIndexRelationship[RangeIndexRelationship["After"] = 4] = "After";
})(exports.RangeIndexRelationship || (exports.RangeIndexRelationship = {}));
var RangeIndexRelationship = exports.RangeIndexRelationship;
(function (RangeRangeRelationship) {
    RangeRangeRelationship[RangeRangeRelationship["Precedes"] = 0] = "Precedes";
    RangeRangeRelationship[RangeRangeRelationship["PrecededBy"] = 1] = "PrecededBy";
    RangeRangeRelationship[RangeRangeRelationship["Meets"] = 2] = "Meets";
    RangeRangeRelationship[RangeRangeRelationship["MetBy"] = 3] = "MetBy";
    RangeRangeRelationship[RangeRangeRelationship["Overlaps"] = 4] = "Overlaps";
    RangeRangeRelationship[RangeRangeRelationship["OverlappedBy"] = 5] = "OverlappedBy";
    RangeRangeRelationship[RangeRangeRelationship["Starts"] = 6] = "Starts";
    RangeRangeRelationship[RangeRangeRelationship["StartedBy"] = 7] = "StartedBy";
    RangeRangeRelationship[RangeRangeRelationship["Contains"] = 8] = "Contains";
    RangeRangeRelationship[RangeRangeRelationship["ContainedBy"] = 9] = "ContainedBy";
    RangeRangeRelationship[RangeRangeRelationship["Finishes"] = 10] = "Finishes";
    RangeRangeRelationship[RangeRangeRelationship["FinishedBy"] = 11] = "FinishedBy";
    RangeRangeRelationship[RangeRangeRelationship["EqualTo"] = 12] = "EqualTo";
})(exports.RangeRangeRelationship || (exports.RangeRangeRelationship = {}));
var RangeRangeRelationship = exports.RangeRangeRelationship;
//# sourceMappingURL=RangeRelationshipUtil.js.map