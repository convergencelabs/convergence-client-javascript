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
      })
      return count;
    },
    resetFilter: function () {
      this.filter = 'all';
    },
    setFilter: function (filter) {
      this.filter = filter;
    },
    toggleTodo: function (id) {
      this.rtTodos.forEach(function (rtTodo) {
        if (rtTodo.get('id').value() === id) {
          rtTodo.set('completed', !rtTodo.get('completed').value());
        }
      });
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
      this.rtTodos.forEach(function (rtTodo, index) {
        if (rtTodo.get('id').value() === id) {
          for(var key in data) {
            rtTodo.set(key, data[key]);
          }
        }
      }.bind(this));
    },
    deleteTodo: function(id) {
      this.rtTodos.forEach(function (rtTodo, index) {
        if (rtTodo.get('id').value() === id) {
          this.rtTodos.remove(index);
        }
      }.bind(this));
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