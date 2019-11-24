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

Vue.component('object-data', {
  props: ["model"],
  data: () => {
    return {
      rtObject: null,
      binding: null,

      removeProp: "",

      addProp: "",
      addPropValue: "",

      setProp: "",
      setPropValue: "",

      oldProp: "",
      newProp: "",

      data: {}
    };
  },
  methods: {
    removeProperty() {
      this.rtObject.remove(this.removeProp);
      delete this.data[this.removeProp];
      this.data = {...this.data};
    },
    setProperty() {
      this.rtObject.set(this.setProp, this.setPropValue);
      this.data[this.setProp] = this.setPropValue;
      this.data = {...this.data};
    },
    addProperty() {
      this.rtObject.set(this.addProp, this.addPropValue);
      this.data[this.addProp] = this.addPropValue;
      this.data = {...this.data};
    },
    renameProperty() {
      this.model.startBatch();
      const curVal = this.rtObject.get(this.oldProp).value();
      this.rtObject.remove(this.oldProp);
      delete this.data[this.oldProp];

      this.rtObject.set(this.newProp, curVal);
      this.data[this.newProp] = curVal;
      this.model.completeBatch();

      this.data = {...this.data};
    },
    bind(rtObject) {
      const onRemove = (evt) => {
        delete this.data[evt.key];
      };
      rtObject.on("remove", onRemove);

      const onSet = (evt) => {
        this.data[evt.key] = evt.value.value();
      };
      rtObject.on("set", onSet);

      this.data = this.rtObject.value();

      return {
        unbind() {
          rtObject.off("remove", onRemove);
          rtObject.off("set", onSet);
        }
      }
    }
  },
  watch: {
    model: function (newModel) {
      if (newModel) {
        this.rtObject = newModel.elementAt("object");
      } else {
        this.rtObject = null;
      }
    },
    rtObject: function (rtObject) {
      if (rtObject) {
        this.binding = this.bind(rtObject);
      } else {
        this.data = {};
        this.binding.unbind();
      }
    }
  },
  template: `
<div class="card">
  <div class="card-body">
    <h5 class="card-title">Object Data</h5>
    <table class="table table-sm">
      <thead>
        <th scope="col">Property</th>
        <th scope="col">Value</th></thead>
      <tbody>
        <tr v-for="key in Object.keys(data).sort()">
          <td>{{key}}</td>
          <td>{{data[key]}}</td>
        </tr>
      </tbody>
    </table>
    <div class="input-group mb-3">
      <button class="btn btn-danger array-button" v-on:click="removeProperty" :disabled="!rtObject">Remove Property</button>
      <div class="input-group-prepend">
        <span class="input-group-text">Property</span>
      </div>
      <select v-model="removeProp" class="form-control">
        <option v-for="key in Object.keys(data).sort()" v-bind:value="key" :disabled="!rtObject">{{key}}</option>
      </select>
    </div>
    
    <div class="input-group mb-3">
      <button class="btn btn-primary array-button" v-on:click="addProperty" :disabled="!rtObject || Object.keys(data).indexOf(addProp) >= 0">Add Prop</button>
      <div class="input-group-prepend">
        <span class="input-group-text">Prop</span>
      </div>
      <input type="text" class="form-control" v-model="addProp" :disabled="!rtObject">
      
      <div class="input-group-prepend">
        <span class="input-group-text">Value</span>
      </div>
      <input type="text" class="form-control" v-model="addPropValue" :disabled="!rtObject">
    </div>
    
    <div class="input-group mb-3">
      <button class="btn btn-primary array-button" v-on:click="setProperty" :disabled="!rtObject">Set Property</button>
      <div class="input-group-prepend">
        <span class="input-group-text">Prop</span>
      </div>
      <select v-model="setProp" class="form-control">
        <option v-for="key in Object.keys(data).sort()" v-bind:value="key" :disabled="!rtObject">{{key}}</option>
      </select>
      <div class="input-group-prepend">
        <span class="input-group-text">Value</span>
      </div>
      <input type="text" class="form-control" v-model="setPropValue" :disabled="!rtObject">
    </div>
    
    <div class="input-group mb-3">
      <button class="btn btn-primary array-button" v-on:click="renameProperty" :disabled="!rtObject || oldProp === newProp">Rename Prop</button>
      <div class="input-group-prepend">
        <span class="input-group-text">Old Prop</span>
      </div>
      <select v-model="oldProp" class="form-control">
        <option v-for="key in Object.keys(data).sort()" v-bind:value="key" :disabled="!rtObject">{{key}}</option>
      </select>
      <div class="input-group-prepend">
        <span class="input-group-text">New Prop</span>
      </div>
      <input type="text" class="form-control" v-model="newProp" :disabled="!rtObject">
    </div>
  </div>
</div>
`
});
