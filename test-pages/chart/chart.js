// Connect to the domain.
ConvergenceDomain.debugFlags.protocol.messages = true;
var domain = new ConvergenceDomain("http://localhost:8080/domain/namespace1/domain1");
domain.on("connected", function () {
  console.log("connected");
});

// Now authenticate.  This is deferred unti connection is successful.
domain.authenticateWithPassword("test1", "password").then(function (username) {
  return domain.modelService().open("example", "pie-chart", function (collectionId, modelId) {
    return initialData;
  });
}).then(function (model) {
  bindToModel(model);
});

var pieChart;
function bindToModel(realTimeModel) {
  var segments = realTimeModel.dataAt("segments");
  var ctx = document.getElementById("pieChart").getContext("2d");
  pieChart = new Chart(ctx).Pie(segments.value(), {
    animationSteps: 0,
    animateRotate: false,
    animationEasing: "linear"
  });

  segments.forEach(function (segment, index) {
    createControl(segment, index);
  });
}

// Creates a new slider control and binds events to it.
function createControl(segment, index) {
  var enabled = segment.get("enabled").value();
  var id = segment.get("label").value();
  var color = segment.get("color").value();
  var value = segment.get("value").value();

  var controlsDiv = document.getElementById("controls");

  var controlDiv = document.createElement("div");
  controlDiv.className = "control";


  var sliderDiv = document.createElement("div");
  sliderDiv.className = "sliders";
  sliderDiv.id = id;
  controlDiv.appendChild(sliderDiv);

  var valueDiv = document.createElement("div");
  valueDiv.className = "value";

  var valueInput = document.createElement("input");
  valueInput.type = "text";
  valueInput.disabled = true;
  valueInput.value = value;
  valueDiv.appendChild(valueInput);

  controlDiv.appendChild(valueDiv);

  noUiSlider.create(sliderDiv, {
    start: 40,
    connect: 'lower',
    step: 1,
    range: {
      'min': 0,
      'max': 100
    }
  });
  sliderDiv.style.background = color;

  sliderDiv.noUiSlider.set(value);

  sliderDiv.noUiSlider.on('slide', function () {
    var val = Math.round(sliderDiv.noUiSlider.get());
    segment.child("value").value(val);
    valueInput.value = val;
    pieChart.segments[index].value = val;
    pieChart.update();
  });

  segment.get("value").on("value", function (e) {
    pieChart.segments[index].value = e.value;
    pieChart.update();
    sliderDiv.noUiSlider.set(e.value);
    valueInput.value = e.value;
  });

  controlsDiv.appendChild(controlDiv);
}

// The default data that is provided if the model does not exist.
var initialData = {
  segments: [
    {
      label: "Red",
      enabled: true,
      value: 80,
      color: "#F7464A",
      highlight: "#FF5A5E"
    },
    {
      label: "Green",
      enabled: true,
      value: 50,
      color: "#46BFBD",
      highlight: "#5AD3D1"
    },
    {
      label: "Yellow",
      enabled: true,
      value: 30,
      color: "#FDB45C",
      highlight: "#FFC870"
    },
    {
      label: "Blue",
      enabled: true,
      value: 18,
      color: "#62b4f7",
      highlight: "#83c0ef"
    }
  ]
};
