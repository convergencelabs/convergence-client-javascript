// These are the various inputs in the example page.
var stringInput = document.getElementById("stringVal");
var booleanInput = document.getElementById("booleanVal");
var numberInput = document.getElementById("numberVal");
var arrayInput = document.getElementById("arrayVal");
var objectTable = document.getElementById("objectVal");


// The realTimeModel.
var model;

// Connect to the domain.
var url = ConvergenceConfig.DOMAIN_URL;
Convergence.debugFlags.protocol.messages = true;

Convergence.connectAnonymously(ConvergenceConfig.DOMAIN_URL).then(function(domain) {
  return domain.models().open("test", "basic-example", function (collectionId, modelId) {
    return {
      "string": "test value",
      "number": 10,
      "boolean": true,
      "array": [
        "Apples",
        "Bananas",
        "Pears",
        "Orange"
      ],
      "object": {
        "key1": "value1",
        "key2": "value2",
        "key3": "value3",
        "key4": "value4"
      }
    };
  });
}).then(function (model) {
  bindToModel(model);
});


// Set up all the events on all the models.
function bindToModel(realTimeModel) {
  model = realTimeModel;

  var rtString = model.elementAt("string");
  bindToTextInput(stringInput, rtString);

  var rtBoolean = model.elementAt("boolean");
  bindCheckboxInput(booleanInput, rtBoolean);

  var rtNumber = model.elementAt("number");
  bindNumberInput(numberInput, rtNumber);

  var rtArray = model.elementAt("array");
  bindSelectList(arrayInput, rtArray);

  renderTable(model.elementAt("object"));
  bindTableButtons();
  bindTableEvents();
}

//
// Handle the number increment / decrement buttons.
//

function numberIncrement() {
  numberInput.value = Number(numberInput.value) + 1;
  var rtNumber = model.elementAt("number");
  rtNumber.increment();
}

function numberDecrement() {
  numberInput.value = Number(numberInput.value) - 1;
  var rtNumber = model.elementAt("number");
  rtNumber.decrement();
}


//
// Handle the array buttons.
//
var arrayRemoveButton = document.getElementById("arrayRemoveButton");
arrayRemoveButton.onclick = function () {
  var selected = Number(arrayInput.selectedIndex);
  if (selected >= 0) {
    arrayInput.remove(selected);
    var rtArray = model.elementAt("array");
    rtArray.remove(selected);
  }
};

var arrayAddButton = document.getElementById("arrayAddButton");
var arrayAddValue = document.getElementById("arrayAddValue");
arrayAddButton.onclick = function () {
  var index = Number(arrayInput.selectedIndex);
  if (index < 0) {
    index = arrayInput.length;
  }

  var option = document.createElement("option");
  option.textContent = arrayAddValue.value;
  arrayInput.add(option, index);
  var rtArray = model.elementAt("array");
  rtArray.insert(index, arrayAddValue.value);
};

var arraySetButton = document.getElementById("arraySetButton");
var arraySetValue = document.getElementById("arraySetValue");

arrayInput.onchange = function () {
  var index = arrayInput.selectedIndex;
  if (index < 0) {
    arraySetValue.value = "";
  } else {
    arraySetValue.value = arrayInput.options[index].value;
  }
};

arraySetButton.onclick = function () {
  var index = arrayInput.selectedIndex;
  if (index >= 0) {
    arrayInput.options[index].textContent = arraySetValue.value;
    var rtArray = model.elementAt("array");
    rtArray.set(index, arraySetValue.value);
  }
};

var arrayReorderButton = document.getElementById("arrayReorderButton");
var arrayReorderValue = document.getElementById("arrayReorderValue");

arrayReorderButton.onclick = function () {
  var fromIdx = arrayInput.selectedIndex;
  if (fromIdx >= 0) {
    var toIdx = Number(arrayReorderValue.value);
    var option = arrayInput.options[fromIdx];
    arrayInput.remove(fromIdx);
    arrayInput.add(option, toIdx);
    var rtArray = model.elementAt("array");
    rtArray.reorder(fromIdx, toIdx);
  }
};

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

  arrayModel.on("remove", function (evt) {
    selectInput.remove(evt.index);
  });

  arrayModel.on("insert", function (evt) {
    var option = document.createElement("option");
    option.textContent = evt.value.value();
    selectInput.add(option, evt.index)
  });

  arrayModel.on("set", function (evt) {
    selectInput.options[evt.index].textContent = evt.value;
    selectInput.options[evt.index].value = evt.value;
  });

  arrayModel.on("reorder", function (evt) {
    var option = selectInput.options[evt.fromIndex];
    selectInput.remove(evt.fromIndex);
    selectInput.add(option, evt.toIndex);
  });
}


//
// Handle the object buttons.
//

var objectRemoveButton = document.getElementById("objectRemoveButton");
var objectRemoveProp = document.getElementById("objectRemoveProp");

var objectSetButton = document.getElementById("objectSetButton");
var objectSetProp = document.getElementById("objectSetProp");
var objectSetValue = document.getElementById("objectSetValue");

var objectRenameButton = document.getElementById("objectRenameButton");
var objectRenameOldProp = document.getElementById("objectRenameOldProp");
var objectRenameNewProp = document.getElementById("objectRenameNewProp");

function bindTableButtons() {
  var rtObject = model.elementAt("object");

  objectRemoveButton.onclick = function() {
    rtObject.remove(objectRemoveProp.value);
    renderTable(rtObject);
  };

  objectSetButton.onclick = function() {
    rtObject.set(objectSetProp.value, objectSetValue.value);
    renderTable(rtObject);
  };

  objectRenameButton.onclick = function() {
    model.startCompound();
    var curVal = rtObject.get(objectRenameOldProp.value).value();
    rtObject.remove(objectRenameOldProp.value);
    rtObject.set(objectRenameNewProp.value, curVal);
    model.endCompound();
    renderTable(rtObject);
  };
}

function bindTableEvents() {
  var rtObject = model.elementAt("object");
  rtObject.on("remove", function(evt) {
    renderTable(rtObject);
  });

  rtObject.on("set", function(evt) {
    renderTable(rtObject);
  });
}


function renderTable(rtObject) {
  var body = objectTable.tBodies[0];
  // clear anything that might be there.
  while (body.firstChild) {
    body.removeChild(body.firstChild);
  }

  rtObject.forEach(function (value, property) {
    addTableRow(property, "" + value.value());
  });
}

function addTableRow(prop, val) {
  var row = document.createElement("tr");
  var propElement = document.createElement("td");
  propElement.innerText = prop;
  row.appendChild(propElement);

  var valElement = document.createElement("td");
  valElement.innerText = val;
  row.appendChild(valElement);

  objectTable.tBodies[0].appendChild(row);
}
