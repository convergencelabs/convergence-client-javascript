var stringInput = document.getElementById("stringVal");
var booleanInput = document.getElementById("booleanVal");
var numberInput = document.getElementById("numberVal");
var arrayInput = document.getElementById("arrayVal");
var consoleDiv = document.getElementById("console");

ConvergenceDomain.debugFlags.protocol.messages = true;

var modelId = "basic-example";
var model;

appendToConsole("connecting...");
var domain = new ConvergenceDomain("http://localhost:8080/domain/namespace1/domain1");
domain.on("connected", function () {
  appendToConsole("connected")
});

appendToConsole("authenticating...");
domain.authenticateWithPassword("test1", "password").then(function (username) {
  appendToConsole("authenticated.");
  return domain.modelService().open("foo", modelId, function (collectionId, modelId) {
    return {
      "string": "test value",
      "number": 10,
      "boolean": true,
      "array": [
        "Apples",
        "Bananas",
        "Pears",
        "Orange"
      ]
    };
  });
}).then(function (model) {
  bindToModel(model);
});

function numberIncrement() {
  numberInput.value = Number(numberInput.value) + 1;
  var rtNumber = model.data().child("number");
  rtNumber.increment();
}

function numberDecrement() {
  numberInput.value = Number(numberInput.value) - 1;
  var rtNumber = model.data().child("number");
  rtNumber.decrement();
}

var arrayRemoveButton = document.getElementById("arrayRemoveButton");
arrayRemoveButton.onclick = function() {
  var selected = Number(arrayInput.selectedIndex);
  if (selected >= 0) {
    arrayInput.remove(selected);
    var rtArray = model.data().child("array");
    rtArray.remove(selected);
  }
};

var arrayAddButton = document.getElementById("arrayAddButton");
var arrayAddValue = document.getElementById("arrayAddValue");
arrayAddButton.onclick = function() {
  var index = Number(arrayInput.selectedIndex);
  if (index < 0) {
    index = arrayInput.length;
  }

  var option = document.createElement("option");
  option.textContent = arrayAddValue.value;
  arrayInput.add(option, index);
  var rtArray = model.data().child("array");
  rtArray.insert(index, arrayAddValue.value);
};

var arraySetButton = document.getElementById("arraySetButton");
var arraySetValue = document.getElementById("arraySetValue");

arrayInput.onchange = function() {
  var index = arrayInput.selectedIndex;
  if (index < 0) {
    arraySetValue.value = "";
  } else {
    arraySetValue.value = arrayInput.options[index].value;
  }
};

arraySetButton.onclick = function() {
  var index = arrayInput.selectedIndex;
  if (index >= 0) {
    arrayInput.options[index].textContent = arraySetValue.value;
    var rtArray = model.data().child("array");
    rtArray.replace(index, arraySetValue.value);
  }
};

var arrayReorderButton = document.getElementById("arrayReorderButton");
var arrayReorderValue = document.getElementById("arrayReorderValue");

arrayReorderButton.onclick = function() {
  var fromIdx = arrayInput.selectedIndex;
  if (fromIdx >= 0) {
    var toIdx = Number(arrayReorderValue.value);
    var option = arrayInput.options[fromIdx];
    arrayInput.remove(fromIdx);
    arrayInput.add(option, toIdx);
    var rtArray = model.data().child("array");
    rtArray.reorder(fromIdx, toIdx);
  }
}

function bindToModel(realTimeModel) {
  model = realTimeModel;
  var root = model.data();

  var rtString = root.child("string");
  bindToTextInput(stringInput, rtString);

  var rtBoolean = root.child("boolean");
  bindCheckboxInput(booleanInput, rtBoolean);

  var rtNumber = root.child("number");
  bindNumberInput(numberInput, rtNumber);

  var rtArray = root.child("array");
  bindSelectList(arrayInput, rtArray);
}

function bindSelectList(selectInput, arrayModel) {
  var values = arrayModel.value();

  // clear anything that might be there.
  while (selectInput.firstChild) {
    selectInput.removeChild(selectInput.firstChild);
  }

  values.forEach(function (item) {
    var option = document.createElement('option');
    option.value = option.textContent = item;
    selectInput.appendChild(option);
  });

  arrayModel.on("remove", function(evt) {
    selectInput.remove(evt.index);
  });

  arrayModel.on("insert", function(evt) {
    var option = document.createElement("option");
    option.textContent = evt.value;
    selectInput.add(option, evt.index)
  });

  arrayModel.on("replace", function(evt) {
    selectInput.options[evt.index].textContent = evt.value;
  });

  arrayModel.on("reorder", function(evt) {
    var option = selectInput.options[evt.fromIndex];
    selectInput.remove(evt.fromIndex);
    selectInput.add(option, evt.toIndex);
  });
}
