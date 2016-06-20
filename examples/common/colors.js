var CONVERGENCE_USERS_COLORS = [
  "#7FDBFF", // Aqua
  "#01FF70", // Lime
  "#FF851B", // Orange
  "#FFDC00", // Yellow
  "#B10DC9", // Purple
  "#FF4136", // Red
  "#0074D9"  // Blue
];

var _nextColorIndex = 0;

function getConvergenceColor() {
  var color = CONVERGENCE_USERS_COLORS[_nextColorIndex++];
  if (_nextColorIndex === CONVERGENCE_USERS_COLORS.length) {
    _nextColorIndex = 0;
  }
  return color;
}