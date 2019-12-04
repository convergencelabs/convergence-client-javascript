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

Vue.component('offline-models', {
  props: ["connected", "offlineModels", "model"],
  data: () => {
    return {
      newSubscription: ""
    };
  },
  methods: {
    subscribeNewModel() {
      this.$emit("subscribe", this.newSubscription);
    },
    open(id) {
      this.$emit("openModel", id);
    },
    subscribe(id) {
      this.$emit("subscribe", id);
    },
    unsubscribe(id) {
      this.$emit("unsubscribe", id);
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
    
    <table class="table table-bordered table-hover table-sm">
      <thead class="thead-light">
        <th scope="col">Model Id</th>
        <th scope="col">Dirty</th>
        <th scope="col">Local</th>
        <th scope="col">Subed</th>
        <th scope="col">Avail</th>
        <th scope="col" class="text-right">Action</th>
      </thead>
      <tbody>
        <tr v-for="offlineModel in offlineModels">
          <td>{{offlineModel.modelId}}</td>
          <td>{{offlineModel.dirty}}</td>
          <td>{{offlineModel.created}}</td>
          <td>{{offlineModel.subscribed}}</td>
          <td>{{offlineModel.available}}</td>
          <td class="text-right">
            <button class="btn btn-primary btn-sm" 
                    v-on:click="open(offlineModel.modelId)" 
                    :disabled="!offlineModel.available || (model && model.modelId() === offlineModel.modelId)">Open</button>
            <button v-if="!offlineModel.subscribed" class="btn btn-primary btn-sm" v-on:click="subscribe(offlineModel.modelId)">Subscribe</button>
            <button v-else class="btn btn-danger btn-sm" v-on:click="unsubscribe(offlineModel.modelId)">Unsubscribe</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
  `
});
