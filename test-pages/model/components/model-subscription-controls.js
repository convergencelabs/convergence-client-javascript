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
      subscriptions: [],
      newSubscription: ""
    };
  },
  created() {
    this.loadSubscriptions();
  },
  methods: {
    subscribe() {
      this.modelService.subscribeOffline(this.newSubscription).then(() => {
        this.newSubscription = "";
        this.loadSubscriptions();
      });
    },
    unsubscribe(modelId) {
      this.modelService.unsubscribeOffline(modelId).then(() => this.loadSubscriptions());
    },
    loadSubscriptions() {
      this.modelService
        .getOfflineSubscriptions()
        .then(subs => {
          this.subscriptions = subs;
        })
        .catch(e => {
          console.error(e);
        });
    }
  },
  template: `
<div class="card">
  <div class="card-body">
    <h5 class="card-title">Model Subscriptions</h5>
    <table class="table">
      <thead>
        <th scope="col">Model Id</th>
        <th scope="col">Action</th></thead>
      <tbody>
        <tr v-for="sub in subscriptions">
          <td>{{sub}}</td>
          <td><button class="btn btn-danger" v-on:click="unsubscribe(sub)">Unsubscribe</button></td>
        </tr>
      </tbody>
    </table>
    <div class="input-group mb-3">
      <button class="btn btn-primary array-button" v-on:click="subscribe" :disabled="!newSubscription || subscriptions.indexOf(newSubscription) >= 0">Subscribe</button>
      <div class="input-group-prepend">
        <span class="input-group-text">Value</span>
      </div>
      <input v-model="newSubscription" type="text" class="form-control" :disabled="false">
    </div>
  </div>
</div>
  `
});
