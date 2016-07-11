var container = document.getElementById('example1');

var hot;

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
    return defaultData;
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
