'use strict';

import https from 'https';

const API_BASE_URL = 'https://app.plugchoice.com';

export interface PlugchoiceCharger {
  uuid: string;
  id: number;
  identity: string;
  reference: string | null;
  connection_status: string;
  status: string | null;
  error: string | null;
  error_info: string | null;
  firmware_version: string | null;
  max_current: string | null;
  model_id: number;
  model?: {
    vendor: string;
    name: string;
  };
  connectors?: PlugchoiceConnector[];
}

export interface PlugchoiceConnector {
  id: number;
  charger_id: number;
  connector_id: number;
  status: string;
  error: string;
  max_amperage: number | null;
  max_voltage: number | null;
}

export interface PlugchoicePowerUsage {
  timestamp: string;
  L1: string;
  L2: string;
  L3: string;
  kW: string;
}

export interface PlugchoiceSampledValue {
  value: string;
  measurand: string;
  phase?: string;
  unit: string;
}

export interface PlugchoiceMeterValue {
  connectorId: number;
  meterValue: Array<{
    timestamp: string;
    sampledValue: PlugchoiceSampledValue[];
  }>;
}

export interface VoltTimeChargerStatus {
  status: string;
  connector_status?: string;
  power?: number;
  current?: number;
  voltage?: number;
  energy_total?: number;
  session_energy?: number;
  current_limit?: number;
  fault?: string;
}

export class VoltTimeApi {
  private token: string;
  private baseUrl: string;

  constructor(token: string, baseUrl: string = API_BASE_URL) {
    this.token = token;
    this.baseUrl = baseUrl;
  }

  setToken(token: string): void {
    this.token = token;
  }

  private async request<T>(method: string, path: string, body?: Record<string, unknown>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const url = new URL(path, this.baseUrl);
      const postData = body !== undefined ? JSON.stringify(body) : undefined;

      const options: https.RequestOptions = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname + url.search,
        method,
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {}),
        },
        timeout: 15000,
      };

      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk: Buffer) => {
          data += chunk.toString();
        });

        res.on('end', () => {
          const statusCode = res.statusCode || 0;

          if (statusCode === 401) {
            reject(new Error('Invalid or expired token (401 Unauthorized)'));
            return;
          }

          if (statusCode === 403) {
            reject(new Error('Access denied (403 Forbidden)'));
            return;
          }

          if (statusCode === 404) {
            reject(new Error('Resource not found (404)'));
            return;
          }

          if (statusCode === 429) {
            reject(new Error('Rate limited — too many requests (429)'));
            return;
          }

          if (statusCode >= 500) {
            reject(new Error(`Plugchoice service error (${statusCode})`));
            return;
          }

          if (statusCode < 200 || statusCode >= 300) {
            reject(new Error(`API error ${statusCode}: ${data.substring(0, 200)}`));
            return;
          }

          if (!data || data.trim() === '') {
            resolve(undefined as unknown as T);
            return;
          }

          try {
            resolve(JSON.parse(data) as T);
          } catch {
            reject(new Error(`Failed to parse response: ${data.substring(0, 100)}`));
          }
        });
      });

      req.on('error', (err: NodeJS.ErrnoException) => {
        const detail = err.code ? `${err.code}: ${err.message || 'unknown'}` : (err.message || String(err));
        reject(new Error(`Network error: ${detail}`));
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timed out after 15s'));
      });

      if (postData) {
        req.write(postData);
      }

      req.end();
    });
  }

  async getChargers(): Promise<PlugchoiceCharger[]> {
    const response = await this.request<{ data: PlugchoiceCharger[] }>('GET', '/api/v3/chargers');
    return response.data || [];
  }

  async getCharger(chargerUuid: string): Promise<PlugchoiceCharger> {
    const response = await this.request<{ data: PlugchoiceCharger }>('GET', `/api/v3/chargers/${chargerUuid}`);
    return response.data;
  }

  async getPowerUsage(chargerUuid: string, connectorId: number = 1): Promise<PlugchoicePowerUsage> {
    return this.request<PlugchoicePowerUsage>(
      'GET',
      `/api/v3/chargers/${chargerUuid}/connectors/${connectorId}/power-usage`,
    );
  }

  async getLatestMeterValue(chargerUuid: string, connectorId: number = 1): Promise<PlugchoiceMeterValue> {
    return this.request<PlugchoiceMeterValue>(
      'GET',
      `/api/v3/chargers/${chargerUuid}/connectors/${connectorId}/latest-metervalue`,
    );
  }

  async getChargerStatus(chargerUuid: string, connectorId: number = 1): Promise<VoltTimeChargerStatus> {
    const [chargerResult, powerResult] = await Promise.allSettled([
      this.getCharger(chargerUuid),
      this.getPowerUsage(chargerUuid, connectorId),
    ]);

    const charger = chargerResult.status === 'fulfilled' ? chargerResult.value : null;
    const power = powerResult.status === 'fulfilled' ? powerResult.value : null;

    const connector = charger?.connectors?.find((c) => c.connector_id === connectorId);
    const rawStatus = connector?.status || charger?.status || null;
    const connectorStatus = connector?.status || undefined;

    const kW = power ? parseFloat(power.kW) : NaN;
    const powerW = isNaN(kW) ? 0 : Math.round(kW * 1000);

    const l1 = power ? parseFloat(power.L1) : NaN;
    const currentA = isNaN(l1) ? 0 : l1;

    let energyTotal: number | undefined;
    let currentLimit: number | undefined;

    try {
      const meter = await this.getLatestMeterValue(chargerUuid, connectorId);
      const samples = meter?.meterValue?.[0]?.sampledValue || [];

      const energySample = samples.find((s) => s.measurand === 'Energy.Active.Import.Register');
      if (energySample) {
        const wh = parseFloat(energySample.value);
        if (!isNaN(wh)) energyTotal = wh / 1000;
      }

      const offeredSample = samples.find((s) => s.measurand === 'Current.Offered');
      if (offeredSample) {
        const offered = parseFloat(offeredSample.value);
        if (!isNaN(offered)) currentLimit = offered;
      }
    } catch {
      /* meter values are optional */
    }

    return {
      status: rawStatus || 'unknown',
      connector_status: connectorStatus,
      power: powerW,
      current: currentA,
      energy_total: energyTotal,
      current_limit: currentLimit,
      fault: charger?.error ?? undefined,
    };
  }

  async startCharging(chargerUuid: string, connectorId: number = 1): Promise<void> {
    await this.request('POST', `/api/v3/chargers/${chargerUuid}/actions/start`, {
      connector_id: connectorId,
      id_token: 'HOMEY',
    });
  }

  async stopCharging(chargerUuid: string): Promise<void> {
    await this.request('POST', `/api/v3/chargers/${chargerUuid}/actions/stop`, {});
  }

  async setCurrentLimit(chargerUuid: string, connectorId: number = 1, current: number): Promise<void> {
    await this.request('POST', `/api/v3/chargers/${chargerUuid}/actions/set-charging-profile`, {
      connector_id: connectorId,
      charging_profile: {
        charging_profile_id: 1,
        stack_level: 0,
        charging_profile_purpose: 'TxDefaultProfile',
        charging_profile_kind: 'Recurring',
        recurrency_kind: 'Daily',
        charging_schedule: {
          charging_rate_unit: 'A',
          charging_schedule_period: [
            { start_period: 0, limit: current, number_phases: 3 },
          ],
        },
      },
    });
  }

  async validateToken(): Promise<void> {
    await this.getChargers();
  }
}
