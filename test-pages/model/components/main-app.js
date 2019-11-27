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
      domain: domain
    };
  },
  methods: {
    onConnected() {
      this.connected = true;
    },
    onDisconnected() {
      this.connected = false;
    },
    onOpenModel(model) {
      this.model = model;
      model.on(Convergence.ModelDeletedEvent.NAME, function (event) {
        console.log('model deleted', model.modelId(), 'remotely?', !event.local);
      });

      model.on(Convergence.ModelPermissionsChangedEvent.NAME, function (event) {
        console.log('permissions changed', event.permissions, event.changed);
      });
    },
    onCloseModel() {
      this.model = null;
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
      v-on:modelOpened="onOpenModel"
      v-on:modelClosed="onCloseModel"
    />
    <model-subscription-controls 
      v-bind:connected="connected"
      v-bind:modelService="domain.models()"
    />
    <online-models 
      v-bind:connected="connected"
      v-bind:modelService="domain.models()"
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
