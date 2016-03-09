function AceMultiSelectionManager(session) {
  this._selections = {};
  this._session = session;
}

AceMultiSelectionManager.prototype.addSelection = function(id, title, color, range) {
  if (this._selections[id] !== undefined) {
    throw new Error("Selection with id already defined: " + id);
  }

  var marker = new AceSelectionMarker(this._session, id, title, color, range);
  this._selections[id] = marker;
  this._session.addDynamicMarker(marker, false);
};

AceMultiSelectionManager.prototype.setSelection = function(id, range) {
  var selection = this._getSelection(id);
  selection.setRange(range);
};

AceMultiSelectionManager.prototype.clearSelection = function(id) {
  var selection = this._getSelection(id);
  selection.setRange(null);
};

AceMultiSelectionManager.prototype.removeSelection = function(id) {
  var selection = this._selections[id];
  if (selection === undefined) {
    throw new Error("Selection not found: " + id);
  }
  this._session.removeMarker(selection.id);
};

AceMultiSelectionManager.prototype._getSelection = function(id) {
  var selection = this._selections[id];
  if (selection === undefined) {
    throw new Error("Selection not found: " + id);
  }
  return selection;
};

function AceSelectionMarker(session, selectionId, title, color, range) {
  this._session = session;
  this._title = title;
  this._color = color;
  this._range = range || null;
  this._selectionId = selectionId;
  this._id;
}

AceSelectionMarker.prototype.update = function (html, markerLayer, session, layerConfig) {
  if (this._range === null) {
    return;
  }

  var screenRange = this._range.toScreenRange(session);

  var height = layerConfig.lineHeight;
  var clazz = "ace-multi-selection";

  var top = markerLayer.$getTop(screenRange.start.row, layerConfig);
  var left = markerLayer.$padding + screenRange.start.column * layerConfig.characterWidth;
  var width = 0;

  if(screenRange.isMultiLine()) {
    html.push(
      "<div class='", clazz, " ace_start' style='",
      "height:", height, "px;",
      "right:0;",
      "top:", top, "px;",
      "left:", left, "px;",
      "background-color:", this._color,
      "'></div>"
    );

    // from start of the last line to the selection end
    top = markerLayer.$getTop(this._range.end.row, layerConfig);
    width = screenRange.end.column * layerConfig.characterWidth;

    html.push(
      "<div class='", clazz, "' style='",
      "height:", height, "px;",
      "width:", width, "px;",
      "top:", top, "px;",
      "left:", markerLayer.$padding, "px;",
      "background-color:", this._color,
      "'></div>"
    );

    // all the complete lines
    height = (this._range.end.row - this._range.start.row - 1) * layerConfig.lineHeight;
    if (height < 0) {
      return;
    }
    top = markerLayer.$getTop(this._range.start.row + 1, layerConfig);

    html.push(
      "<div class='", clazz, "' style='",
      "height:", height, "px;",
      "right:0;",
      "top:", top, "px;",
      "left:", markerLayer.$padding, "px;",
      "background-color:", this._color,
      "'></div>"
    );
  } else {
    width = (this._range.end.column - this._range.start.column) * layerConfig.characterWidth;
    html.push(
      "<div class='", clazz, "' style='",
      "height:", height, "px;",
      "width:", width, "px;",
      "top:", top, "px;",
      "left:", left, "px;",
      "background-color:", this._color,
      "'></div>"
    );
  }
};

AceSelectionMarker.prototype.setRange = function (range) {
  this._range = range;
  this._forceSessionUpdate();
};

AceSelectionMarker.prototype.selectionId = function () {
  return this._selectionId;
};

AceSelectionMarker.prototype.markerId = function () {
  return this._id;
};

AceSelectionMarker.prototype._forceSessionUpdate = function() {
  this._session._signal("changeBackMarker");
};
