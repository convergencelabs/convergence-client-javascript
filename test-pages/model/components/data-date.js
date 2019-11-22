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

Vue.component('date-data', {
  props: ["model"],
  data: () => {
    return {
      rtDate: null,
      binding: null
    };
  },
  methods: {
    setDate() {
      const date = new Date();
      this.rtDate.value(date);
      this.$refs["input"].value = date.toUTCString()
    },
    bind(input, element) {
      input.value = element.value().toUTCString();
      const change = (evt) => {
        input.value = evt.element.value().toUTCString();
      };
      element.on("value", change);

      return {
        unbind: () => {
          element.off("value", change);
        }
      }
    },
  },
  watch: {
    model: function (newModel) {
      if (newModel) {
        this.rtDate = newModel.elementAt("date");
      } else {
        this.rtDate = null;
        this.$refs["input"].value = "";
      }
    },
    rtDate: function (newRtDate) {
      if (newRtDate) {
        this.binding = this.bind(this.$refs["input"], newRtDate);
      } else {
        this.binding.unbind();
      }
    }
  },
  template: `
<div class="card">
  <div class="card-body">
    <h5 class="card-title">Date Data</h5>
    <div class="input-group mb-3">
      <button id="currentDateButton" v-on:click="setDate" class="btn btn-primary array-button" :disabled="!rtDate">Set Date To Now</button>
      <div class="input-group-prepend">
        <span class="input-group-text">Date</span>
      </div>
      <input ref="input" type="text" class="form-control" disabled="disabled">
    </div>
  </div>
</div>
`
});
