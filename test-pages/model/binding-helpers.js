// This file contains some basic bindings between models ad HTML input
// elements.

function bindToTextInput(textArea, rtString) {
  const events = ['input'];
  textArea.value = rtString.value();

  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    textArea.addEventListener(event, handleTextAreaEvent, false);
  }

  function handleTextAreaEvent() {
    processEvent(rtString.value(), textArea.value);
  }

  function processEvent(oldval, newval) {
    let commonEnd;
    let commonStart;

    if (oldval === newval) {
      return;
    }

    commonStart = 0;
    while (oldval.charAt(commonStart) === newval.charAt(commonStart)) {
      commonStart++;
    }

    commonEnd = 0;
    while (oldval.charAt(oldval.length - 1 - commonEnd) === newval.charAt(newval.length - 1 - commonEnd) &&
    commonEnd + commonStart < oldval.length && commonEnd + commonStart < newval.length) {
      commonEnd++;
    }

    if (oldval.length !== commonStart + commonEnd) {
      rtString.remove(commonStart, oldval.length - commonStart - commonEnd);
    }

    if (newval.length !== commonStart + commonEnd) {
      rtString.insert(commonStart, newval.slice(commonStart, (newval.length - commonEnd)));
    }
  }

  rtString.on("insert", function (event) {
    const oldVal = textArea.value;
    textArea.value = oldVal.substring(0, event.index) +
      event.value +
      oldVal.substring(event.index, oldVal.length);
  });

  rtString.on("remove", function (event) {
    const oldVal = textArea.value;
    textArea.value = oldVal.substring(0, event.index) +
      oldVal.substring(event.index + event.value.length, oldVal.length);
  });

  rtString.on("value", function (event) {
    textArea.value = event.value;
  });
}

function bindNumberInput(numberInput, numberModel) {
  numberInput.value = numberModel.value();
  numberInput.onchange = function () {
    numberModel.value(Number(numberInput.value));
  };

  numberModel.on("value", function (evt) {
    numberInput.value = evt.element.value();
  });

  numberModel.on("delta", function (evt) {
    numberInput.value = Number(numberInput.value) + evt.value;
  });
}

function bindCheckboxInput(checkboxInput, booleanModel) {
  booleanInput.checked = booleanModel.value();
  booleanInput.onchange = function () {
    booleanModel.value(booleanInput.checked);
  };

  booleanModel.on("value", function (evt) {
    booleanInput.checked = evt.element.value();
  });
}
