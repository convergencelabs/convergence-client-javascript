function AceMultiCursorManager(session) {
  this._cursors = {};
  this._session = session;
}

AceMultiCursorManager.prototype.addCursor = function(id, title, color, position) {
  if (this._cursors[id] !== undefined) {
    throw new Error("Cursor with id already defined: " + id);
  }

  var marker = new AceCursorMarker(this._session, id, title, color, position);
  this._cursors[id] = marker;
  this._session.addDynamicMarker(marker, false);
};

AceMultiCursorManager.prototype.setCursor = function(id, position) {
  var cursor = this._getCursor(id);
  cursor.setPosition(position);
};

AceMultiCursorManager.prototype.clearCursor = function(id) {
  var cursor = this._getCursor(id);
  cursor.setPosition(null);
};

AceMultiCursorManager.prototype.removeCursor = function(id) {
  var cursor = this._cursors[id];
  if (cursor === undefined) {
    throw new Error("Cursor not found: " + id);
  }
  this._session.removeMarker(cursor.id);
};

AceMultiCursorManager.prototype.removeAll = function () {
  var self = this;
  Object.getOwnPropertyNames(this._cursors).forEach(function(key) {
    self.removeCursor(self._cursors[key].cursorId());
  });
};

AceMultiCursorManager.prototype._getCursor = function(id) {
  var cursor = this._cursors[id];
  if (cursor === undefined) {
    throw new Error("Cursor not found: " + id);
  }
  return cursor;
};


function AceCursorMarker(session, cursorId, title, color, position) {
  this._session = session;
  this._title = title;
  this._color = color;
  this._position = position ? this._convertPosition(position) : null;
  this._cursorId = cursorId;
  this._id;
}

AceCursorMarker.prototype.update = function (html, markerLayer, session, layerConfig) {
  if (this._position === null) {
    return;
  }

  var screenPosition = this._session.documentToScreenPosition(
    this._position.row, this._position.column);

  var top = markerLayer.$getTop(screenPosition.row, layerConfig);
  var left = markerLayer.$padding + screenPosition.column * layerConfig.characterWidth;
  var height = layerConfig.lineHeight;

  html.push(
    "<div class='", "ace-multi-cursor ace_start", "' style='",
    "height:", height - 3, "px;",
    "width:", 2, "px;",
    "top:", top + 2, "px;",
    "left:", left, "px;",
    "background-color:", this._color, ";",
    "'></div>"
  );

  // Caret Top
  html.push(
    "<div class='", "ace-multi-cursor ace_start", "' style='",
    "height:", 5, "px;",
    "width:", 6, "px;",
    "top:", top - 2, "px;",
    "left:", left - 2, "px;",
    "background-color:", this._color, ";",
    "'></div>"
  );
};

AceCursorMarker.prototype.setPosition = function (position) {
  this._position = this._convertPosition(position);
  this._forceSessionUpdate();
};

AceCursorMarker.prototype.setVisible = function (visible) {
  var old = this._visible;
  this._visible = visible;
  if (old !== this._visible) {
    this._forceSessionUpdate();
  }
};

AceCursorMarker.prototype.isVisible = function () {
  return this._visible;
};

AceCursorMarker.prototype.cursorId = function () {
  return this._cursorId;
};

AceCursorMarker.prototype.markerId = function () {
  return this._id;
};

AceCursorMarker.prototype._forceSessionUpdate = function() {
  this._session._signal("changeBackMarker");
};

AceCursorMarker.prototype._convertPosition = function(position) {
  var type = typeof position;
  if (position === null) {
    return null;
  } else if (type === "number") {
    return this._session.getDocument().indexToPosition(position, 0);
  } else if (typeof position.row == "number" && typeof position.column === "number"){
    return position;
  } else {
    throw new Error("Invalid position: " + position);
  }
};
