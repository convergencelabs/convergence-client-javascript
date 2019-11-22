/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "COPYING" and
 * "COPYING.LESSER" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

Vue.component('array-data', {
  props: ["model"],
  data: () => {
    return {
      rtArray: null,
      data: [],
      binding: null,
      selectedIndex: -1,
      addValue: "",
      setValue: "",
      reorderValue: 0
    };
  },
  methods: {
    removeItem() {
      if (this.selectedIndex >= 0) {
        this.rtArray.remove(this.selectedIndex);
        this.data = this.rtArray.value();
      }
    },
    addItem() {
      let index = this.selectedIndex;
      if (index < 0) {
        index = this.data.length;
      }

      this.rtArray.insert(index, this.addValue);
      this.data = this.rtArray.value();
    },
    reorder() {
      const fromIdx = this.selectedIndex;
      if (fromIdx >= 0) {
        const toIdx = this.reorderValue;
        this.rtArray.reorder(fromIdx, toIdx);
        this.data = this.rtArray.value();
      }
    },
    selectItem(event) {
      const index = event.target.selectedIndex;
      if (index < 0) {
        this.setValue = "";
        this.selectedIndex = -1;
      } else {
        this.selectedIndex = index;
        this.setValue = this.data[index];
      }
    },
    setItem(event) {
      const index = this.selectedIndex;
      if (index >= 0) {
        this.rtArray.set(index, this.setValue);
        this.data = this.rtArray.value();
      }
    },
    bind(rtArray) {
      const onRemove = (evt) => {
        this.data.splice(evt.index, 1);
      };
      rtArray.on("remove", onRemove);

      const onInsert =  (evt) => {
        this.data.splice(evt.index, 0, evt.value.value());
      };
      rtArray.on("insert", onInsert);

      const onSet = (evt) => {
        this.data[evt.index].delta = evt.value;
      };
      rtArray.on("set",  onSet);

      const onReorder = (evt) => {
        const value = this.data[evt.fromIndex];
        this.data.splice(evt.fromIndex, 1);
        this.data.splice(evt.toIndex, 0, value);
      }
      rtArray.on("reorder",  onReorder);

      return {
        unbind: () => {
          rtArray.off("remove",  onRemove);
          rtArray.off("insert",  onInsert);
          rtArray.off("set",  onSet);
          rtArray.off("reorder",  onReorder);
        }
      };
    }
  },
  watch: {
    model: function (newModel) {
      if (newModel) {
        this.rtArray = newModel.elementAt("array");
      } else {
        this.binding.unbind();
        this.rtArray = null;
      }
    },
    rtArray: function (rtArray) {
      if (rtArray) {
        this.data = rtArray.value();
        this.binding = this.bind(rtArray);
      } else {
        this.data = [];
        this.binding.unbind();
      }
    }
  },
  template: `
<div class="card">
  <div class="card-body">
    <h5 class="card-title">Array Data</h5>
    <select size="10" id="arrayVal" v-on:change="selectItem">
    <option v-for="item in data">{{ item }}</option>
    </select>
    <div class="input-group mb-3">
      <button class="btn btn-danger array-button" v-on:click="removeItem" :disabled="!rtArray">Remove Item</button>
    </div>
    <div class="input-group mb-3">
      <button class="btn btn-primary array-button" v-on:click="addItem" :disabled="!rtArray">Add Item</button>
      <div class="input-group-prepend">
        <span class="input-group-text">Value</span>
      </div>
      <input v-model="addValue" type="text" class="form-control" :disabled="!rtArray">
    </div>
    <div class="input-group mb-3">
      <button class="btn btn-primary array-button" v-on:click="setItem" :disabled="!rtArray">Set Value</button>
      <div class="input-group-prepend">
        <span class="input-group-text">Value</span>
      </div>
      <input v-model="setValue" type="text" class="form-control" :disabled="!rtArray">
    </div>
    <div class="input-group mb-3">
      <button class="btn btn-primary array-button" 
        v-on:click="reorder" 
        :disabled="!rtArray || selectedIndex < 0 || reorderValue < 0 || reorderValue >= data.length"
      >Reorder</button>
      <div class="input-group-prepend">
        <span class="input-group-text">To Index</span>
      </div>
      <input
        min="0"
        v-bind:max="data.length - 1" 
        v-model.number="reorderValue"
        type="number" 
        class="form-control"
        :disabled="!rtArray"/>
    </div>
  </div>
</div>
`
});
