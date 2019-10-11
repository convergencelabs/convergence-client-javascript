const status = document.getElementById("connectionStatus");
status.innerHTML = "Connecting";

// These are the various inputs in the example page.
const stringInput = document.getElementById("stringVal");
const booleanInput = document.getElementById("booleanVal");
const numberInput = document.getElementById("numberVal");
const arrayInput = document.getElementById("arrayVal");
const objectTable = document.getElementById("objectVal");
const dateInput = document.getElementById("currentDate");

// The realTimeModel.
let model;

const baseURL = window.location.href.split('?')[0];
const modelId = getParameterByName("modelId");

Convergence.configureLogging({
  loggers: {
    "protocol.messages": Convergence.LogLevel.DEBUG,
    "storage": Convergence.LogLevel.DEBUG
  }
});

const storage = new Convergence.IdbStorageAdapter();

const options = {
  reconnect: {
    fallbackAuth: (authChallenge) => {
      authChallenge.anonymous();
    }
  },
  offline: {
    storage: storage
  }
};

const domain = new Convergence.ConvergenceDomain(DOMAIN_URL, options);

domain.connectAnonymously(DOMAIN_URL, options).then(d => {

});

domain.events().subscribe(e => {
  switch (e.name) {
    case "connecting":
      status.innerHTML = "Connecting";
      break;
    case "connected":
      status.innerHTML = "Connected";
      break;
    case "disconnected":
      status.innerHTML = "Disconnected";
      break;
  }
});

domain.models().openAutoCreate({
  collection: "test",
  id: modelId,
  data: {
    "string": "String data to edit",
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
    },
    "date": new Date()
  },
  overrideWorld: true,
  worldPermissions: {read: true, write: true, remove: false, manage: false},
  ephemeral: false
}).then(function (model) {
  const modelId = model.modelId();
  const url = baseURL + "?modelId=" + modelId;
  window.history.pushState(modelId, modelId, url);
  bindToModel(model);
});

// Set up all the events on all the models.
function bindToModel(realTimeModel) {
  model = realTimeModel;

  model.on(Convergence.ModelDeletedEvent.NAME, function(event) {
    console.log('model deleted', event.src.modelId(), 'remotely?', !event.local);
  })
  model.on(Convergence.ModelPermissionsChangedEvent.NAME, function (event) {
    console.log('permissions changed', event.permissions, event.changed);
  });

  const rtString = model.elementAt("string");
  bindToTextInput(stringInput, rtString);

  const rtBoolean = model.elementAt("boolean");
  bindCheckboxInput(booleanInput, rtBoolean);

  const rtNumber = model.elementAt("number");
  bindNumberInput(numberInput, rtNumber);

  const rtArray = model.elementAt("array");
  bindSelectList(arrayInput, rtArray);

  renderTable(model.elementAt("object"));
  bindTableButtons();
  bindTableEvents();
  bindDateEvents();
}

//
// Handle the number increment / decrement buttons.
//

function numberIncrement() {
  numberInput.value = Number(numberInput.value) + 1;
  const rtNumber = model.elementAt("number");
  rtNumber.increment();
}

function numberDecrement() {
  numberInput.value = Number(numberInput.value) - 1;
  const rtNumber = model.elementAt("number");
  rtNumber.decrement();
}


//
// Handle the array buttons.
//
const arrayRemoveButton = document.getElementById("arrayRemoveButton");
arrayRemoveButton.onclick = function () {
  const selected = Number(arrayInput.selectedIndex);
  if (selected >= 0) {
    arrayInput.remove(selected);
    const rtArray = model.elementAt("array");
    rtArray.remove(selected);
  }
};

const arrayAddButton = document.getElementById("arrayAddButton");
const arrayAddValue = document.getElementById("arrayAddValue");
arrayAddButton.onclick = function () {
  let index = Number(arrayInput.selectedIndex);
  if (index < 0) {
    index = arrayInput.length;
  }

  const option = document.createElement("option");
  option.textContent = arrayAddValue.value;
  arrayInput.add(option, index);
  const rtArray = model.elementAt("array");
  rtArray.insert(index, arrayAddValue.value);
};

const arraySetButton = document.getElementById("arraySetButton");
const arraySetValue = document.getElementById("arraySetValue");

arrayInput.onchange = function () {
  let index = arrayInput.selectedIndex;
  if (index < 0) {
    arraySetValue.value = "";
  } else {
    arraySetValue.value = arrayInput.options[index].value;
  }
};

arraySetButton.onclick = function () {
  let index = arrayInput.selectedIndex;
  if (index >= 0) {
    arrayInput.options[index].textContent = arraySetValue.value;
    const rtArray = model.elementAt("array");
    rtArray.set(index, arraySetValue.value);
  }
};

const arrayReorderButton = document.getElementById("arrayReorderButton");
const arrayReorderValue = document.getElementById("arrayReorderValue");

arrayReorderButton.onclick = function () {
  const fromIdx = arrayInput.selectedIndex;
  if (fromIdx >= 0) {
    const toIdx = Number(arrayReorderValue.value);
    const option = arrayInput.options[fromIdx];
    arrayInput.remove(fromIdx);
    arrayInput.add(option, toIdx);
    const rtArray = model.elementAt("array");
    rtArray.reorder(fromIdx, toIdx);
  }
};

function bindSelectList(selectInput, arrayModel) {
  const values = arrayModel.value();

  // clear anything that might be there.
  while (selectInput.firstChild) {
    selectInput.removeChild(selectInput.firstChild);
  }

  values.forEach(function (item) {
    const option = document.createElement('option');
    option.value = option.textContent = item;
    selectInput.appendChild(option);
  });

  arrayModel.on("remove", function (evt) {
    selectInput.remove(evt.index);
  });

  arrayModel.on("insert", function (evt) {
    const option = document.createElement("option");
    option.textContent = evt.value.value();
    selectInput.add(option, evt.index)
  });

  arrayModel.on("set", function (evt) {
    selectInput.options[evt.index].textContent = evt.value;
    selectInput.options[evt.index].delta = evt.value;
  });

  arrayModel.on("reorder", function (evt) {
    const option = selectInput.options[evt.fromIndex];
    selectInput.remove(evt.fromIndex);
    selectInput.add(option, evt.toIndex);
  });
}


//
// Handle the object buttons.
//

const objectRemoveButton = document.getElementById("objectRemoveButton");
const objectRemoveProp = document.getElementById("objectRemoveProp");

const objectSetButton = document.getElementById("objectSetButton");
const objectSetProp = document.getElementById("objectSetProp");
const objectSetValue = document.getElementById("objectSetValue");

const objectRenameButton = document.getElementById("objectRenameButton");
const objectRenameOldProp = document.getElementById("objectRenameOldProp");
const objectRenameNewProp = document.getElementById("objectRenameNewProp");

function bindTableButtons() {
  const rtObject = model.elementAt("object");

  objectRemoveButton.onclick = function () {
    rtObject.remove(objectRemoveProp.value);
    renderTable(rtObject);
  };

  objectSetButton.onclick = function () {
    rtObject.set(objectSetProp.value, objectSetValue.value);
    renderTable(rtObject);
  };

  objectRenameButton.onclick = function () {
    model.startBatch();
    const curVal = rtObject.get(objectRenameOldProp.value).value();
    rtObject.remove(objectRenameOldProp.value);
    rtObject.set(objectRenameNewProp.value, curVal);
    model.completeBatch();
    renderTable(rtObject);
  };
}

function bindTableEvents() {
  const rtObject = model.elementAt("object");
  rtObject.on("remove", () => {
    renderTable(rtObject);
  });

  rtObject.on("set", () => {
    renderTable(rtObject);
  });
}


function renderTable(rtObject) {
  const body = objectTable.tBodies[0];
  // clear anything that might be there.
  while (body.firstChild) {
    body.removeChild(body.firstChild);
  }

  rtObject.forEach(function (value, property) {
    addTableRow(property, "" + value.value());
  });
}

function addTableRow(prop, val) {
  const row = document.createElement("tr");
  const propElement = document.createElement("td");
  propElement.innerText = prop;
  row.appendChild(propElement);

  const valElement = document.createElement("td");
  valElement.innerText = val;
  row.appendChild(valElement);

  objectTable.tBodies[0].appendChild(row);
}

function bindDateEvents() {
  const rtDate = model.elementAt("date");
  dateInput.value = rtDate.value().toUTCString();
  rtDate.on("value", function (evt) {
    dateInput.value = evt.element.value().toUTCString();
  });
}

function setDate() {
  const rtDate = model.elementAt("date");
  const date = new Date();
  rtDate.value(date);
  dateInput.value = date.toUTCString()
}

function getParameterByName(name, url) {
  if (!url) {
    url = window.location.href;
  }
  name = name.replace(/[\[\]]/g, "\\$&");
  const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function disconnect() {
  domain.disconnect();
}

function connect() {
  domain.reconnect();
}
