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

Vue.component('model-subscription-controls', {
  props: ["connected", "modelService"],
  data: () => {
    return {
      offlineModels: [],
      selected: null,
      newSubscription: ""
    };
  },
  created() {
    this.loadSubscriptions();
  },
  methods: {
    selectRow(modelId) {
      this.selected = modelId;
    },
    isSelectedSubscribed() {
      const record = this.offlineModels.find(v => v.modelId === this.selected);
      return record && record.subscribed;
    },
    subscribeNewModel() {
      this.modelService.subscribeOffline(this.newSubscription).then(() => {
        this.newSubscription = "";
        this.loadSubscriptions();
      });
    },
    subscribeSelectedModel() {
      this.modelService.subscribeOffline(this.selected).then(() => this.loadSubscriptions());
    },
    unsubscribeSelectedModel() {
      this.modelService.unsubscribeOffline(this.selected).then(() => this.loadSubscriptions());
    },
    openSelectedModel() {

    },
    deleteSelectedModel() {

    },
    loadSubscriptions() {
      this.modelService
        .getOfflineModelMetaData()
        .then(subs => {
          this.offlineModels = subs;
          if (this.offlineModels.find(m => m.modelId === this.selected) === undefined) {
            this.selected = null;
          }
        })
        .catch(e => {
          console.error(e);
        });
    }
  },
  template: `
<div class="card">
  <div class="card-body">
    <h5 class="card-title">Offline Models</h5>
    <div class="input-group mb-3">
      <button class="btn btn-primary array-button" 
              v-on:click="subscribeNewModel" 
              :disabled="!newSubscription || offlineModels.find(sub => sub.modelId === newSubscription)"
      >Subscribe</button>
      <div class="input-group-prepend">
        <span class="input-group-text">Model Id</span>
      </div>
      <input v-model="newSubscription" type="text" class="form-control" :disabled="!connected">
    </div>
    
    <div class="text-right mb-3">
      <button class="btn btn-primary btn-sm" v-on:click="openSelectedModel" :disabled="!selected">Open</button>
      <button v-if="isSelectedSubscribed()" 
              class="btn btn-warning btn-sm"
              v-on:click="unsubscribeSelectedModel"
              :disabled="!selected"
       >Unsubscribe</button>
      <button v-else class="btn btn-primary btn-sm" v-on:click="subscribeSelectedModel" :disabled="!selected">Subscribe</button>
      <button class="btn btn-danger btn-sm" v-on:click="deleteSelectedModel" :disabled="!selected">Delete</button>
    </div>
    
    <table class="table table-bordered table-hover table-sm">
      <thead class="thead-light">
        <th scope="col">Model Id</th>
        <th scope="col">Dirty</th>
        <th scope="col">Local</th>
        <th scope="col">Subscribed</th>
        <th scope="col">Downloaded</th>
      </thead>
      <tbody>
        <tr v-for="model in offlineModels" v-on:click="selectRow(model.modelId)" v-bind:class="{ selected: selected === model.modelId }">
          <td>{{model.modelId}}</td>
          <td>{{model.dirty}}</td>
          <td>{{model.created}}</td>
          <td>{{model.subscribed}}</td>
          <td>{{model.available}}</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
  `
});
