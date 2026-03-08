'use strict';

import Homey from 'homey';
import { VoltTimeApi } from '../../lib/api/voltTimeApi';

module.exports = class Source2SDriver extends Homey.Driver {

  async onInit(): Promise<void> {
    this.log('Source2S driver initialized');
  }

  async onPair(session: Homey.Driver.PairSession): Promise<void> {
    let token = '';
    let api: VoltTimeApi;

    const t = (key: string) => this.homey.__(`pair.errors.${key}`);

    session.setHandler('login', async (data: { username: string; password: string }) => {
      token = data.username.trim();

      if (!token) {
        throw new Error(t('enter_token'));
      }

      api = new VoltTimeApi(token);
      try {
        await api.validateToken();
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        this.error(`Token validation failed: ${msg}`);
        throw new Error(`${t('invalid_token')} (${msg})`);
      }

      return true;
    });

    session.setHandler('list_devices', async () => {
      if (!api) {
        return [];
      }

      try {
        const chargers = await api.getChargers();

        if (!chargers || chargers.length === 0) {
          throw new Error(t('no_chargers'));
        }

        return chargers.map((charger) => {
          const modelName = charger.model
            ? `${charger.model.vendor} ${charger.model.name}`.trim()
            : 'Charger';
          const displayName = charger.reference || charger.identity || modelName;

          return {
            name: displayName,
            data: {
              id: charger.uuid,
              token,
            },
            settings: {
              token,
              connector_id: 1,
              poll_interval_idle: 60,
              poll_interval_charging: 10,
            },
            store: {
              model: modelName,
              serial_number: charger.identity || '',
              site_name: '',
            },
          };
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        this.error(`Failed to list chargers: ${message}`);
        throw new Error(`${t('could_not_retrieve')} ${message}`);
      }
    });
  }

};
