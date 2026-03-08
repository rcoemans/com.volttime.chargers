'use strict';

import https from 'https';

const API_BASE_URL = 'https://api.volttime.com';

export interface VoltTimeCharger {
  id: string;
  name: string;
  model: string;
  site_name?: string;
  serial_number?: string;
  firmware_version?: string;
  connectors?: VoltTimeConnector[];
}

export interface VoltTimeConnector {
  id: number;
  status: string;
  type?: string;
}

export interface VoltTimeChargerStatus {
  status: string;
  connector_status?: string;
  power?: number;
  current?: number;
  voltage?: number;
  energy_total?: number;
  session_energy?: number;
  temperature?: number;
  soc?: number;
  current_limit?: number;
  fault?: string;
}

export interface VoltTimeApiResponse<T> {
  data: T;
  status: number;
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

      const options: https.RequestOptions = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname + url.search,
        method,
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
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
            reject(new Error('Invalid or expired token'));
            return;
          }

          if (statusCode === 404) {
            reject(new Error('Resource not found'));
            return;
          }

          if (statusCode === 429) {
            reject(new Error('Rate limited — too many requests'));
            return;
          }

          if (statusCode >= 500) {
            reject(new Error(`Volt Time Cloud service error (${statusCode})`));
            return;
          }

          if (statusCode < 200 || statusCode >= 300) {
            reject(new Error(`API request failed with status ${statusCode}`));
            return;
          }

          try {
            const parsed = JSON.parse(data) as T;
            resolve(parsed);
          } catch {
            reject(new Error('Failed to parse API response'));
          }
        });
      });

      req.on('error', (err: Error) => {
        reject(new Error(`Network error: ${err.message}`));
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timed out'));
      });

      if (body) {
        req.write(JSON.stringify(body));
      }

      req.end();
    });
  }

  async getChargers(): Promise<VoltTimeCharger[]> {
    const response = await this.request<{ data: VoltTimeCharger[] }>('GET', '/chargers');
    return response.data || (response as unknown as VoltTimeCharger[]);
  }

  async getCharger(chargerId: string): Promise<VoltTimeCharger> {
    const response = await this.request<{ data: VoltTimeCharger }>('GET', `/chargers/${chargerId}`);
    return response.data || (response as unknown as VoltTimeCharger);
  }

  async getChargerStatus(chargerId: string, connectorId: number = 1): Promise<VoltTimeChargerStatus> {
    const response = await this.request<{ data: VoltTimeChargerStatus }>(
      'GET',
      `/chargers/${chargerId}/connectors/${connectorId}/status`,
    );
    return response.data || (response as unknown as VoltTimeChargerStatus);
  }

  async startCharging(chargerId: string, connectorId: number = 1): Promise<void> {
    await this.request('POST', `/chargers/${chargerId}/connectors/${connectorId}/start`);
  }

  async stopCharging(chargerId: string, connectorId: number = 1): Promise<void> {
    await this.request('POST', `/chargers/${chargerId}/connectors/${connectorId}/stop`);
  }

  async setCurrentLimit(chargerId: string, connectorId: number = 1, current: number): Promise<void> {
    await this.request('POST', `/chargers/${chargerId}/connectors/${connectorId}/current-limit`, {
      current_limit: current,
    });
  }

  async validateToken(): Promise<boolean> {
    try {
      await this.getChargers();
      return true;
    } catch {
      return false;
    }
  }
}
