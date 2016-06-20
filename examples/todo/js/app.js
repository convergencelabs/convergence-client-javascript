/*global jQuery, Handlebars, Router */
jQuery(function ($) {
  'use strict';

  Handlebars.registerHelper('eq', function (a, b, options) {
    return a === b ? options.fn(this) : options.inverse(this);
  });

  var ENTER_KEY = 13;
  var ESCAPE_KEY = 27;

  var util = {
    uuid: function () {
      /*jshint bitwise:false */
      var i, random;
      var uuid = '';

      for (i = 0; i < 32; i++) {
        random = Math.random() * 16 | 0;
        if (i === 8 || i === 12 || i === 16 || i === 20) {
          uuid += '-';
        }
        uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
      }

      return uuid;
    },
    pluralize: function (count, word) {
      return count === 1 ? word : word + 's';
    }
  };

  var App = {
    init: function () {
      this.model = new app.Model('todos-convergence');

      this.todoTemplate = Handlebars.compile($('#todo-template').html());
      this.footerTemplate = Handlebars.compile($('#footer-template').html());
      
      this.bindEvents();
      this.listenToExternalEvents();

      new Router({
        '/:filter': function (filter) {
          this.model.setFilter(filter);
          this.model.loaded.then(function() {
            this.render();
          }.bind(this));
        }.bind(this)
      }).init('/all');
    },
    bindEvents: function () {
      $('#new-todo').on('keyup', this.create.bind(this));
      $('#toggle-all').on('change', this.toggleAll.bind(this));
      $('#footer').on('click', '#clear-completed', this.destroyCompleted.bind(this));
      $('#todo-list')
        .on('change', '.toggle', this.toggle.bind(this))
        .on('dblclick', 'label', this.edit.bind(this))
        .on('keyup', '.edit', this.editKeyup.bind(this))
        .on('focusout', '.edit', this.update.bind(this))
        .on('click', '.destroy', this.destroy.bind(this))
        .on('dragstart', 'li', this.dragStart.bind(this))
        .on('dragend', 'li', this.dragEnd.bind(this))
        .on('dragenter', 'li', this.dragEnter.bind(this))
        .on('dragleave', 'li', this.dragLeave.bind(this))
        .on('dragover', 'li', this.dragOver.bind(this))
        .on('drop', 'li', this.drop.bind(this));
    },
    listenToExternalEvents: function() {
      this.model.loaded.then(function() {
        this.model.rtTodos.on('model_changed', function() {
          this.render();
        }.bind(this));
      }.bind(this));
    },
    render: function () {
      var todos = this.model.getViewTodos();
      $('#todo-list').html(this.todoTemplate(todos));
      //this.bindDragAndDropEvents();
      $('#main').toggle(todos.length > 0);
      $('#toggle-all').prop('checked', this.model.getActiveTodoCount() === 0);
      this.renderFooter();
      $('#new-todo').focus();
    },
    renderFooter: function () {
      var todoCount = this.model.rtTodos.length();
      var activeTodoCount = this.model.getActiveTodoCount();
      var template = this.footerTemplate({
        activeTodoCount: activeTodoCount,
        activeTodoWord: util.pluralize(activeTodoCount, 'item'),
        completedTodos: todoCount - activeTodoCount,
        filter: this.model.filter
      });

      $('#footer').toggle(todoCount > 0).html(template);
    },
    toggleAll: function (e) {
      var isChecked = $(e.target).prop('checked');
      this.model.toggleAll(isChecked);
      this.render();
    },
    destroyCompleted: function () {
      this.model.deleteCompletedTodos();
      this.model.resetFilter();
      this.render();
    },
    // accepts an element from inside the `.item` div and
    // returns the corresponding index in the `todos` array
    idFromEl: function (el) {
      return $(el).closest('li').data('id');
    },
    create: function (e) {
      var $input = $(e.target);
      var val = $input.val().trim();

      if (e.which !== ENTER_KEY || !val) {
        return;
      }

      this.model.addTodo({
        id: util.uuid(),
        title: val,
        completed: false
      });

      $input.val('');

      this.render();
    },
    toggle: function (e) {
      var id = this.idFromEl(e.target);
      this.model.toggleTodo(id);
      this.render();
    },
    edit: function (e) {
      var $input = $(e.target).closest('li').addClass('editing').find('.edit');
      $input.val($input.val()).focus();
    },
    editKeyup: function (e) {
      if (e.which === ENTER_KEY) {
        e.target.blur();
      }

      if (e.which === ESCAPE_KEY) {
        $(e.target).data('abort', true).blur();
      }
    },
    update: function (e) {
      var el = e.target;
      var $el = $(el);
      var val = $el.val().trim();

      if (!val) {
        this.destroy(e);
        return;
      }

      if ($el.data('abort')) {
        $el.data('abort', false);
      } else {
        var id = this.idFromEl(el);
        this.model.editTodo(id, {title: val});
      }

      this.render();
    },
    destroy: function (e) {
      var id = this.idFromEl(e.target);
      this.model.deleteTodo(id);
      this.render();
    },
    dragStart: function(e) {
      var listItemEl = $(e.currentTarget);
      this.draggedEl = listItemEl;
      e.originalEvent.dataTransfer.effectAllowed = 'move';
      e.originalEvent.dataTransfer.setData('text/plain', listItemEl.data('id'));
      listItemEl.addClass('dragging');
    },
    dragEnd: function(e) {
      var listItemEl = $(e.currentTarget);
      listItemEl.removeClass('dragging');
    },
    dragOver: function(e) {
      if (e.preventDefault) {
        e.preventDefault(); // Necessary. Allows us to drop.
      }
      //e.originalEvent.dataTransfer.dropEffect = 'move';
      return false;
    },
    dragEnter: function(e) {
      var el = $(e.currentTarget);
      el.addClass('drag-over');
    },
    dragLeave: function(e) {
      var el = $(e.currentTarget);
      el.removeClass('drag-over');
    },
    drop: function(e) {
      var listItemEl = $(e.currentTarget);
      if (e.stopPropagation) {
        e.stopPropagation(); // Stops some browsers from redirecting.
      }

      // Don't do anything if dropping the same column we're dragging.
      if (this.draggedEl != listItemEl) {
        this.model.moveTodo(this.draggedEl.data('id'), listItemEl.data('id'));
        this.render();
      }
      return false;
    }
  };

  App.init();
});
