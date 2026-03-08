'use strict';

import { ChargerBase } from '../../lib/chargerBase';

module.exports = class Source2SDevice extends ChargerBase {

  async onInit(): Promise<void> {
    await super.onInit();
    this.log('Source 2S device initialized');
  }

};
