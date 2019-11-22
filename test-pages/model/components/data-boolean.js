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

Vue.component('boolean-data', {
  props: ["model"],
  data: () => {
    return {
      rtBoolean: null,
      binding: null
    };
  },
  watch: {
    model: function (newModel) {
      if (newModel) {
        this.rtBoolean = newModel.elementAt("number");
      } else {
        this.rtBoolean = null;
        this.$refs["input"].checked = false;
      }
    },
    rtBoolean: function (newRtBoolean) {
      if (newRtBoolean) {
        this.binding = ConvergenceInputElementBinder.bindCheckboxInput(this.$refs["input"], newRtBoolean);
      } else {
        this.binding.unbind();
      }
    }
  },
  template: `
 <div class="card">
  <div class="card-body">
    <h5 class="card-title">Boolean Data</h5>
    <input type="checkbox" ref="input" :disabled="!rtBoolean"/>
  </div>
</div>
`
});
