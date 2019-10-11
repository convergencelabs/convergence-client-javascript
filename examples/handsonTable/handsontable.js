var container = document.getElementById('example1');

var hot;

// The realTimeModel.
var model;

// Connect to the domain.
Convergence.configureLogging({
  loggers: {
    "protocol.messages": Convergence.LogLevel.DEBUG
  }
});
Convergence.connect(DOMAIN_URL, "test1", "password").then(function (domain) {
  return domain.models().openAutoCreate({
    collection: "foo",
    id: "basic-example",
    data: defaultData
  });
}).then(function (model) {
  bindToModel(model);
});


// Set up all the events on all the models.
function bindToModel(realTimeModel) {
  model = realTimeModel;
  hot = Handsontable(container, {
    data: model.dataAt("table").value(),
    currentRowClassName: 'currentRow',
    currentColClassName: 'currentCol',
    rowHeaders: true,
    colHeaders: true
  });

  bindTableEvents();
}

function bindTableEvents() {
  Handsontable.hooks.add('afterChange', function(changes, source) {
    console.log(source, changes)
  }, hot);


  Handsontable.hooks.add('afterSelection', function(r1, c1, r2, c2) {
    console.log(r1, c1, r2, c2);
    //getActiveEditor
  }, hot);
}


//hot.selectCell(2, 2, 3, 3);

function remoteSelect(row, column, userId) {
  var td = hot.getCell(3,3);
  td.className = "remoteSelection"
}

//remoteSelect(3,3, "foo");
