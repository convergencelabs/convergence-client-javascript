// These are the various inputs in the example page.
var stringInput = document.getElementById("stringVal");
var shareCursorCheckbox = document.getElementById("shareCursor");

// The realTimeModel.
var model;

// Connect to the domain.
ConvergenceDomain.debugFlags.protocol.messages = true;
var domain = new ConvergenceDomain(connectionConfig.SERVER_URL + "/domain/namespace1/domain1");
domain.on("connected", function () {
  console.log("connected");
});

// Now authenticate.  This is deferred unti connection is successful.
domain.authenticateWithPassword("test1", "password").then(function (username) {
  return domain.modelService().open("foo", "basic-example", function (collectionId, modelId) {
    return {
      "text": "test value"
    };
  });
}).then(function (model) {
  bindToModel(model);
});


// Set up all the events on all the models.
function bindToModel(realTimeModel) {
  model = realTimeModel;

  var rtString = model.dataAt("text");
  bindToTextInput(stringInput, rtString);

  stringInput.addEventListener("keydown", setCursorPosition, false);
  stringInput.addEventListener("click", setCursorPosition, false);
  var currentCursor = -1;

  cursorRef = rtString.indexReference("cursor");

  shareCursorCheckbox.onclick = function(e) {
    if (shareCursorCheckbox.checked) {
      cursorRef.publish();
    } else {
      cursorRef.unpublish();
    }
  };

  function setCursorPosition() {
    setTimeout(function () {
      var newCursor = stringInput.selectionEnd;
      if (currentCursor !== newCursor) {
        currentCursor = newCursor;
        cursorRef.set(currentCursor);
      }
    }, 0);
  }
}
