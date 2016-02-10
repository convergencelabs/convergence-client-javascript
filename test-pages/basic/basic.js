// These are the various inputs in the example page.
var stringInput = document.getElementById("stringVal");
var booleanInput = document.getElementById("booleanVal");
var numberInput = document.getElementById("numberVal");
var arrayInput = document.getElementById("arrayVal");
var objectTable = document.getElementById("objectVal");

// This is where we send events to.
var consoleDiv = document.getElementById("console");


// The realTimeModel.
var model;

// Connect to the domain.
ConvergenceDomain.debugFlags.protocol.messages = true;
var domain = new ConvergenceDomain("http://localhost:8080/domain/namespace1/domain1");
domain.on("connected", function () {
  console.log("connected");
});

// Now authenticate.  This is deferred unti connection is successful.
domain.authenticateWithPassword("test1", "password").then(function (username) {
  return domain.modelService().open("foo", "basic-example", function (collectionId, modelId) {
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

  var rtString = model.dataAt("string");
  bindToTextInput(stringInput, rtString);

  var rtBoolean = model.dataAt("boolean");
  bindCheckboxInput(booleanInput, rtBoolean);

  var rtNumber = model.dataAt("number");
  bindNumberInput(numberInput, rtNumber);

  var rtArray = model.dataAt("array");
  bindSelectList(arrayInput, rtArray);

  renderTable(model.dataAt("object"));
  bindTableButtons();
  bindTableEvents();
}

//
// Handle the number increment / decrement buttons.
//

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


//
// Handle the array buttons.
//
var arrayRemoveButton = document.getElementById("arrayRemoveButton");
arrayRemoveButton.onclick = function () {
  var selected = Number(arrayInput.selectedIndex);
  if (selected >= 0) {
    arrayInput.remove(selected);
    var rtArray = model.data().child("array");
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
  var rtArray = model.data().child("array");
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
    var rtArray = model.data().child("array");
    rtArray.replace(index, arraySetValue.value);
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
    var rtArray = model.data().child("array");
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
    option.textContent = evt.value;
    selectInput.add(option, evt.index)
  });

  arrayModel.on("replace", function (evt) {
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

function bindTableButtons() {
  var rtObject = model.data().child("object");

  objectRemoveButton.onclick = function() {
    rtObject.removeProperty(objectRemoveProp.value);
    renderTable(rtObject);
  };

  objectSetButton.onclick = function() {
    rtObject.setProperty(objectSetProp.value, objectSetValue.value);
    renderTable(rtObject);
  };
}

function bindTableEvents() {
  var rtObject = model.data().child("object");
  rtObject.on("removeProperty", function(evt) {
    renderTable(rtObject);
  });

  rtObject.on("setProperty", function(evt) {
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
