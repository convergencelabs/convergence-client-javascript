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

Vue.component('main-app', {
  data: () => {
    const options = {
      reconnect: {
        fallbackAuth: (authChallenge) => {
          authChallenge.anonymous();
        }
      },
      offline: {
        storage: new Convergence.IdbStorageAdapter()
      }
    };

    this.domain = new Convergence.ConvergenceDomain(DOMAIN_URL, options);

    return {
      connected: false,
      model: null,
      domain: domain,
      offlineModels: [],
      onlineModels: []
    };
  },
  created() {
    this.domain.models().events().subscribe(e => {
      console.log(e);
      if (e.name.startsWith("offline_model")) {
        this.refreshOfflineModels();
        if (e.name === "offline_model_sync_completed") {
          this.refreshOnlineModels();
        }
      } else if (e.name === "deleted" && this.model && this.model.modelId() === e.src.modelId()) {
        this.onCloseModel();
      }
    })
  },
  methods: {
    refreshAll() {
      this.refreshOfflineModels();
      this.refreshOnlineModels();
    },
    onConnected() {
      this.connected = true;
      this.refreshAll()
    },
    onDisconnected() {
      this.connected = false;
      this.offlineModels = [];
      this.onlineModels = [];
    },
    onOpenModel(id) {
      this.onCloseModel();
      const options = this.buildCreateOptions(id);
      this.domain
        .models()
        .openAutoCreate(options)
        .then((model) => {
          this.model = model;
          this.refreshAll();
        })
        .catch(e => console.error(e));
    },
    onCloseModel() {
      if (this.model && !this.model.isClosing()) {
        this.model.close().catch(e => console.error(e));
      }

      this.model = null;
    },
    onCreateModel(id) {
      const options = this.buildCreateOptions(id);
      this.domain
        .models()
        .create(options)
        .then(() => this.refreshAll())
        .catch(e => console.error(e));
    },
    onDeleteModel(id) {
      domain
        .models()
        .remove(id)
        .then(() => this.refreshAll())
        .catch(e => console.error(e));
    },
    onSubscribe(id) {
      this.domain
        .models()
        .subscribeOffline(id)
        .then(() => this.refreshOfflineModels())
        .catch(e => console.error(e));
    },
    onUnsubscribe(id) {
      this.domain
        .models()
        .unsubscribeOffline(id)
        .then(() => this.refreshOfflineModels())
        .catch(e => console.error(e));
    },
    refreshOnlineModels() {
      this.onlineModels = [];

      if (this.connected && this.domain.session().isConnected()) {
        const query = "SELECT * FROM model-test-page";
        this.domain
          .models()
          .query(query)
          .then(results => {
            this.onlineModels = [];
            results.data.forEach(model => {
              this.onlineModels.push({modelId: model.modelId, version: model.version});
            })
          })
          .catch(e => console.error(e));
      }
    },
    refreshOfflineModels() {
      this.domain
        .models()
        .getOfflineModelMetaData()
        .then(subs => {
          this.offlineModels = subs;
        })
        .catch(e => {
          console.error(e);
        });
    },
    buildCreateOptions(id) {
      return {
        collection: "model-test-page",
        id: id,
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
        worldPermissions: {read: true, write: true, remove: false, manage: false}
      }
    }
  },
  template: `
<div class="row">
  <div class="col-6">
    <connection-controls
      v-bind:domain="domain"
      v-bind:connected="connected"
      v-on:connected="onConnected"
      v-on:disconnected="onDisconnected"
    />
    <model-controls 
      v-bind:connected="connected"
      v-bind:model="model"
      v-on:deleteModel="onDeleteModel"
      v-on:createModel="onCreateModel"
      v-on:openModel="onOpenModel"
      v-on:closeModel="onCloseModel"
    />
    <offline-models
      v-bind:connected="connected"
      v-bind:model="model"
      v-bind:offlineModels="offlineModels"
      v-on:openModel="onOpenModel"
      v-on:deleteModel="onDeleteModel"
      v-on:subscribe="onSubscribe"
      v-on:unsubscribe="onUnsubscribe"
    />
    <online-models 
      v-bind:connected="connected"
      v-bind:onlineModels="onlineModels"
      v-on:deleteModel="onDeleteModel"
      v-on:openModel="onOpenModel"
      v-on:subscribe="onSubscribe"
      v-on:refresh="refreshOnlineModels"
    />
  </div>
  <div class="col-6">
   <string-data v-bind:model="model" />
   <number-data v-bind:model="model" />
   <boolean-data v-bind:model="model" />
   <date-data v-bind:model="model" />
   <array-data v-bind:model="model" />
   <object-data v-bind:model="model" />
  </div>
</div>
`
});
