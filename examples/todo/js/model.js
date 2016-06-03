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
    }
  };

  // Export to window
  window.app = window.app || {};
  window.app.Model = Model;
})(window);