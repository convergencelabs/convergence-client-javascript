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

Vue.component('number-data', {
  props: ["model"],
  data: () => {
    return {
      rtNumber: null,
      binding: null
    };
  },
  methods: {
    numberIncrement() {
      const input = this.$refs["input"];
      input.value = Number(input.value) + 1;
      this.rtNumber.increment();
    },
    numberDecrement() {
      const input = this.$refs["input"];
      input.value = Number(input.value) - 1;
      this.rtNumber.decrement();
    }
  },
  watch: {
    model: function (newModel) {
      if (newModel) {
        this.rtNumber = newModel.elementAt("number");
      } else {
        this.rtNumber = null;
        this.$refs["input"].value = "";
      }
    },
    rtNumber: function (newRtNumber) {
      if (newRtNumber) {
        this.binding = ConvergenceInputElementBinder.bindNumberInput(this.$refs["input"], newRtNumber);
      } else {
        this.binding.unbind();
      }
    }
  },
  template: `
<div class="card">
  <div class="card-body">
    <h5 class="card-title">Number Data</h5>
    <div class="input-group mb-3">
      <button class="btn btn-primary mr-3" v-on:click="numberIncrement" :disabled="!rtNumber">Increment</button>
      <button class="btn btn-primary mr-3" v-on:onclick="numberDecrement" :disabled="!rtNumber">Decrement</button>
      
      <div class="input-group-prepend">
        <span class="input-group-text">Value</span>
      </div>
      
      <input type="number" ref="input" class="form-control" :disabled="!rtNumber">
    </div>
  </div>
</div>
`
});
