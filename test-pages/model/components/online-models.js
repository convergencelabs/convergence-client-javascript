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

Vue.component('online-models', {
  props: ["enabled", "onlineModels"],
  data: () => {
    return {
      models: []
    };
  },
  methods: {
    subscribe(id) {
      this.$emit("subscribe", id);
    },
    openModel(id) {
      this.$emit("openModel", id);
    },
    deleteModel(id) {
      this.$emit("deleteModel", id);
    },
    refresh() {
      this.$emit("refresh");
    },
  },
  template: `
<div class="card">
  <div class="card-body">
    <h5 class="card-title">Online Models</h5>
    <div class="text-right mb-3">
      <button class="btn btn-primary btn-sm" :disabled="!enabled" v-on:click="refresh">Refresh</button>
    </div>
    <table class="table table-bordered table-hover table-sm">
      <thead class="thead-light">
        <th scope="col">Model Id</th>
        <th scope="col">Version</th>
        <th scope="col">Actions</th>
      </thead>
      <tbody>
        <tr v-for="model in onlineModels">
          <td>{{model.modelId}}</td>
          <td>{{model.version}}</td>
          <td class="text-right">
            <button class="btn btn-primary btn-sm" v-on:click="subscribe(model.modelId)">Subscribe</button>
            <button class="btn btn-primary btn-sm" v-on:click="openModel(model.modelId)">Open</button>
            <button class="btn btn-danger btn-sm" v-on:click="deleteModel(model.modelId)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
  `
});
