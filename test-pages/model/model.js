const status = document.getElementById("connectionStatus");
status.value = "Disconnected";

// These are the various inputs in the example page.
const stringInput = document.getElementById("stringVal");
const booleanInput = document.getElementById("booleanVal");
const numberInput = document.getElementById("numberVal");
const numberIncrementInput = document.getElementById("numberIncrement");
const numberDecrementInput = document.getElementById("numberDecrement");

const arrayInput = document.getElementById("arrayVal");
const objectTable = document.getElementById("objectVal");
const dateInput = document.getElementById("currentDate");
const currentDateButton = document.getElementById("currentDateButton");

const openButton = document.getElementById("open");
const closeButton = document.getElementById("close");

const connectOnlineButton = document.getElementById("connectOnline");
const connectOfflineButton = document.getElementById("connectOffline");
const disconnectButton = document.getElementById("disconnect");

const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");


// The realTimeModel.
let model;

const baseURL = window.location.href.split('?')[0];
const modelId = getModelId();

Convergence.configureLogging({
  loggers: {
    "protocol.messages": Convergence.LogLevel.DEBUG,
    "models": Convergence.LogLevel.DEBUG
  }
});

const options = {
  reconnect: {
    fallbackAuth: (authChallenge) => {
      authChallenge.anonymous();
    }
  },
  offline: {
    storage: new Convergence.IdbStorageAdapter()
  }
};

const domain = new Convergence.ConvergenceDomain(DOMAIN_URL, options);

domain.events().subscribe(e => {
  switch (e.name) {
    case "connecting":
      status.value = "Connecting";
      break;
    case "connected":
      status.value = "Connected";
      break;
    case "disconnected":
      status.value = "Disconnected";
      break;
  }
});

function connectOnline() {
  const username = usernameInput.value;
  const password = passwordInput.value;
  domain
    .connectWithPassword({username, password})
    .then(() => {

      onConnect();
    })
    .catch(e => console.error())
}

function connectOffline() {
  domain
    .connectOffline("test")
    .then(() => {

      onConnect();
    })
    .catch(e => console.error())
}

function onConnect() {
  connectOnlineButton.disabled = true;
  connectOfflineButton.disabled = true;
  disconnectButton.disabled = false;

  if (model) {
    openButton.disabled = true;
    closeButton.disabled = false;
  } else {
    openButton.disabled = false;
    closeButton.disabled = true;
  }
}

function disconnect() {
  domain.disconnect();
  connectOnlineButton.disabled = false;
  connectOfflineButton.disabled = false;
  disconnectButton.disabled = true;
  openButton.disabled = true;
  closeButton.disabled = true;
}

function openModel() {
  openButton.disabled = true;
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
    model.subscribeOffline();
    bindToModel(model);
    closeButton.disabled = false;

    stringInput.disabled = false;
    booleanInput.disabled = false;

    numberInput.disabled = false;
    numberIncrementInput.disabled = false;
    numberDecrementInput.disabled = false;

    arrayAddButton.disabled = false;
    arrayRemoveButton.disabled = false;
    arraySetButton.disabled = false;
    arrayReorderButton.disabled = false;

    objectRemoveButton.disabled = false;
    objectSetButton.disabled = false;
    objectRenameButton.disabled = false;

    currentDateButton.disabled = false;
  }).catch(e => console.error(e));
}

// Set up all the events on all the models.
function bindToModel(realTimeModel) {
  model = realTimeModel;

  model.on(Convergence.ModelDeletedEvent.NAME, function(event) {
    console.log('model deleted', event.src.modelId(), 'remotely?', !event.local);
  });

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

function closeModel() {
  if (model) {
    model.close();

    numberInput.value = "";
    numberInput.disabled = true;

    stringInput.value = "";
    booleanInput.checked = false;

    while (arrayInput.firstChild) {
      arrayInput.removeChild(arrayInput.firstChild);
    }

    openButton.disabled = false;
    closeButton.disabled = true;

    stringInput.disabled = true;
    booleanInput.disabled = true;

    numberInput.disabled = true;
    numberIncrementInput.disabled = true;
    numberDecrementInput.disabled = true;

    arrayAddButton.disabled = true;
    arrayRemoveButton.disabled = true;
    arraySetButton.disabled = true;
    arrayReorderButton.disabled = true;

    objectRemoveButton.disabled = true;
    objectSetButton.disabled = true;
    objectRenameButton.disabled = true;

    currentDateButton.disabled = true;

    model = undefined;
  }
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

function getModelId() {
  const urlParams = new URLSearchParams(location.search);
  if (urlParams.has("modelId")) {
    return urlParams.get("modelId");
  } else {
    return createUUID();
  }
}

function createUUID() {
  let dt = new Date().getTime();
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (dt + Math.random() * 16) % 16 | 0;
    dt = Math.floor(dt / 16);
    return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
  return uuid;
}
