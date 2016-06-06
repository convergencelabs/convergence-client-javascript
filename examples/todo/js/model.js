(function (window) {
  'use strict';

  ConvergenceDomain.debugFlags.protocol.messages = true;

  /**
   * Creates a new Model instance and hooks up the storage.
   *
   * @constructor
   * @param {object} storage A reference to the client side storage class
   */
  function Model(name) {
    this.domain = new ConvergenceDomain(connectionConfig.SERVER_URL + '/domain/namespace1/domain1');

    this.loaded = this.domain.authenticateWithPassword('test1', 'password').then(function (username) {
      return this.domain.modelService().open('example', name, function (collectionId, modelId) {
        return {
          todos: []
        };
      });
    }.bind(this)).then(function (model) {
      this.rtModel = model;
      this.rtTodos = model.dataAt('todos');
    }.bind(this));
  }

  Model.prototype = {
    /* filters the todos and returns the base data associated with each. */
    getViewTodos: function () {
      var viewTodos = [];
      this.rtTodos.forEach(function (rtTodo) {
        if (!this.filter || this.filter === 'all') {
          viewTodos.push(rtTodo.value());
        } else if (this.filter === 'active' && !rtTodo.value().completed) {
          viewTodos.push(rtTodo.value());
        } else if (this.filter === 'completed' && rtTodo.value().completed) {
          viewTodos.push(rtTodo.value());
        }
      }.bind(this));
      return viewTodos;
    },
    getActiveTodoCount: function () {
      var count = 0;
      this.rtTodos.forEach(function (rtTodo) {
        if (!rtTodo.value().completed) {
          count++;
        }
      });
      return count;
    },
    resetFilter: function () {
      this.filter = 'all';
    },
    setFilter: function (filter) {
      this.filter = filter;
    },
    getTodo: function(id) {
      var todo;
      this.rtTodos.forEach(function (rtTodo) {
        if (!todo && rtTodo.get('id').value() === id) {
          todo = rtTodo;
        }
      });
      return todo;
    },
    getTodoIndex: function(id) {
      var index = -1;
      this.rtTodos.forEach(function (rtTodo, i) {
        if (index < 0 && rtTodo.get('id').value() === id) {
          index = i;
        }
      });
      return index;
    },
    toggleTodo: function (id) {
      var rtTodo = this.getTodo(id);
      if(rtTodo) {
        rtTodo.set('completed', !rtTodo.get('completed').value());
      }
    },
    toggleAll: function(completed) {
      this.rtTodos.forEach(function (rtTodo) {
        rtTodo.set('completed', completed);
      });
    },
    addTodo: function(todo) {
      this.rtTodos.push(todo);
    },
    editTodo: function(id, data) {
      var rtTodo = this.getTodo(id);
      if(rtTodo) {
        for(var key in data) {
          rtTodo.set(key, data[key]);
        }
      }
    },
    moveTodo(id, idToReplace) {
      var index = this.getTodoIndex(id);
      var newIndex = this.getTodoIndex(idToReplace);
      if(newIndex >= 0) {
        this.rtTodos.reorder(index, newIndex);
      }
    },
    deleteTodo: function(id) {
      var index = this.getTodoIndex(id);
      if(index >= 0) {
        this.rtTodos.remove(index); 
      }
    },
    deleteCompletedTodos: function() {
      // start at the end so the indices don't shift while we're deleting elements
      for(var i = this.rtTodos.length(); i--; i >= 0) {
        if (this.rtTodos.get(i).get('completed').value() === true) {
          this.rtTodos.remove(i);
        }
      }
    }
  };

  // Export to window
  window.app = window.app || {};
  window.app.Model = Model;
})(window);
