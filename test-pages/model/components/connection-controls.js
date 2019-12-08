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

Vue.component('connection-controls', {
  props: ["offlineInitialized", "connected", "domain"],
  data: () => {
    return {
      username: "test",
      password: "password",
      status: "Disconnected"
    }
  },
  created: function () {
    this.domain.events().subscribe(e => {
      switch (e.name) {
        case "connecting":
          this.status = "Connecting";
          break;
        case "connected":
          this.status = "Connected";
          break;
        case "disconnected":
          this.status = "Disconnected";
          break;
      }
    });
  },
  methods: {
    connect() {
      this.$emit("connect", this.username, this.password);
    },
    initOffline() {
      this.$emit("initOffline", this.username);
    },
    disconnect() {
      this.$emit("disconnect");
    }
  },
  template: `
<div class="card">
  <div class="card-body">
    <h5 class="card-title">Connection Control</h5>
    <div class="mb-3">
      <div class="input-group mb-3">
        <div class="input-group-prepend"><span class="input-group-text">Username</span></div>
        <input type="text" class="form-control" v-model="username" :disabled="offlineInitialized || connected"/>
      </div>
      <div class="input-group mb-3">
        <div class="input-group-prepend"><span class="input-group-text">Password</span></div>
        <input type="text" class="form-control" v-model="password"  :disabled="connected"/>
      </div>
    </div>
    <div class="mb-3">
      <button class="btn btn-primary" v-bind:disabled="offlineInitialized" v-on:click="initOffline">Init Offline</button>
      <button class="btn btn-primary" v-bind:disabled="!connected" v-on:click="disconnect">Disconnect</button>
      <button class="btn btn-primary" v-bind:disabled="connected" v-on:click="connect">Connect</button>
    </div>
    <div class="input-group mb-3">
      <div class="input-group-prepend"><span class="input-group-text">Connection Status</span></div>
      <input type="text" class="form-control" v-model="status" readonly="readonly">
    </div>
  </div>
</div>  
  `
});