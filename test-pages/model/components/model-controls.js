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

Vue.component('model-controls', {
  props: ["connected", "model"],
  data: () => {
    return {
      modelId: getModelId()
    };
  },
  methods: {
    openModel() {
      domain.models().openAutoCreate({
        collection: "test",
        id: this.modelId,
        data: {
          "string": "String data to edit",
          "number": 10,
          "boolean": true,
          "array": [
            "Apples",
            "Bananas",
            "Pears",
            "Orange"
          ],
          "object": {
            "key1": "value1",
            "key2": "value2",
            "key3": "value3",
            "key4": "value4"
          },
          "date": new Date()
        },
        overrideWorld: true,
        worldPermissions: {read: true, write: true, remove: false, manage: false},
        ephemeral: false
      }).then((model) => {
        this.$emit("modelOpened", model);
        model.subscribeOffline();
      }).catch(e => console.error(e));
    },
    closeModel() {
      this.model.close();
      this.$emit("modelClosed");
    }

  },
  template: `
<div class="card">
  <div class="card-body">
    <h5 class="card-title">Model Control</h5>
    <div class="input-group mb-3">
      <div class="input-group-prepend"><span class="input-group-text">Model Id</span></div>
      <input type="text" class="form-control" v-model="modelId" readonly="readonly">
    </div>
    <button class="btn btn-primary" :disabled="!connected || model !== null" v-on:click="openModel">Open Model</button>
    <button class="btn btn-primary" :disabled="!connected || model === null" v-on:click="closeModel">Close Model</button>
  </div>
</div>
  `
});

function getModelId() {
  const urlParams = new URLSearchParams(location.search);
  if (urlParams.has("modelId")) {
    return urlParams.get("modelId");
  } else {
    const modelId = createUUID();
    urlParams.set("modelId", modelId);
    window.history.replaceState({}, "", decodeURIComponent(`${location.pathname}?${urlParams}`));
  }
}

function createUUID() {
  let dt = new Date().getTime();
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (dt + Math.random() * 16) % 16 | 0;
    dt = Math.floor(dt / 16);
    return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
  return uuid;
}
