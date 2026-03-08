'use strict';

import Homey from 'homey';
import { VoltTimeApi, VoltTimeChargerStatus } from './api/voltTimeApi';

const POWER_CHANGE_DEADBAND = 100; // W — minimum change to trigger power_changed

export class ChargerBase extends Homey.Device {
  private api!: VoltTimeApi;
  private chargerId!: string;
  private connectorId!: number;
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private previousPower: number = 0;
  private previousStatus: string = 'unknown';
  private previousChargeLimit: number = 0;
  private isCharging: boolean = false;
  private consecutiveFailures: number = 0;
  private lastSuccessfulUpdate: number = 0;

  async onInit(): Promise<void> {
    const data = this.getData();
    const settings = this.getSettings();

    this.chargerId = data.id;
    this.connectorId = settings.connector_id || 1;

    const token = settings.token || data.token || '';
    this.api = new VoltTimeApi(token);

    this.registerCapabilityListener('onoff', this.onCapabilityOnoff.bind(this));
    this.registerCapabilityListener('target_charging_current', this.onCapabilityTargetChargingCurrent.bind(this));

    this.startPolling();

    this.log(`ChargerBase initialized for charger ${this.chargerId}, connector ${this.connectorId}`);
  }

  async onSettings(event: { oldSettings: Record<string, unknown>; newSettings: Record<string, unknown>; changedKeys: string[] }): Promise<string | void> {
    if (event.changedKeys.includes('token')) {
      this.api.setToken(event.newSettings.token as string);
      this.log('API token updated');
    }

    if (event.changedKeys.includes('connector_id')) {
      this.connectorId = event.newSettings.connector_id as number;
      this.log(`Connector ID changed to ${this.connectorId}`);
    }

    if (event.changedKeys.includes('poll_interval_idle') || event.changedKeys.includes('poll_interval_charging')) {
      this.restartPolling();
    }
  }

  async onDeleted(): Promise<void> {
    this.stopPolling();
    this.log('Device deleted, polling stopped');
  }

  private startPolling(): void {
    this.stopPolling();
    const interval = this.getPollInterval();
    this.pollTimer = setInterval(() => this.refreshState(), interval * 1000);
    this.refreshState();
  }

  private stopPolling(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  private restartPolling(): void {
    this.startPolling();
  }

  private getPollInterval(): number {
    const settings = this.getSettings();
    if (this.isCharging) {
      return (settings.poll_interval_charging as number) || 10;
    }
    return (settings.poll_interval_idle as number) || 60;
  }

  async refreshState(): Promise<void> {
    try {
      const status = await this.api.getChargerStatus(this.chargerId, this.connectorId);
      this.consecutiveFailures = 0;
      this.lastSuccessfulUpdate = Date.now();

      await this.setAvailable();
      await this.updateCapabilities(status);
    } catch (err) {
      this.consecutiveFailures++;
      const message = err instanceof Error ? err.message : String(err);
      this.error(`Failed to refresh charger state (attempt ${this.consecutiveFailures}): ${message}`);

      if (this.consecutiveFailures >= 5) {
        await this.setUnavailable(`Unable to reach charger: ${message}`);

        const currentPower = this.getCapabilityValue('measure_power');
        if (currentPower && currentPower > 0) {
          await this.safeSetCapabilityValue('measure_power', 0);
        }
      }
    }
  }

  private async updateCapabilities(status: VoltTimeChargerStatus): Promise<void> {
    const chargerStatus = this.normalizeStatus(status.status);
    const wasCharging = this.isCharging;
    this.isCharging = chargerStatus === 'charging';

    // Charger status
    await this.safeSetCapabilityValue('charger_status', chargerStatus);

    // Connector status
    if (status.connector_status) {
      await this.safeSetCapabilityValue('connector_status', status.connector_status);
    }

    // On/off (charging state)
    await this.safeSetCapabilityValue('onoff', this.isCharging);

    // Power
    const power = this.clampValue(status.power, 0);
    await this.safeSetCapabilityValue('measure_power', power);

    // Current
    if (status.current !== undefined && status.current !== null) {
      await this.safeSetCapabilityValue('measure_current', this.clampValue(status.current, 0));
    }

    // Voltage
    if (status.voltage !== undefined && status.voltage !== null) {
      await this.safeSetCapabilityValue('measure_voltage', this.clampValue(status.voltage, 0));
    }

    // Total energy (kWh)
    if (status.energy_total !== undefined && status.energy_total !== null) {
      await this.safeSetCapabilityValue('meter_power', this.roundValue(status.energy_total, 2));
    }

    // Session energy (kWh)
    if (status.session_energy !== undefined && status.session_energy !== null) {
      await this.safeSetCapabilityValue('meter_session_energy', this.roundValue(status.session_energy, 2));
    }

    // Current limit
    if (status.current_limit !== undefined && status.current_limit !== null) {
      await this.safeSetCapabilityValue('target_charging_current', status.current_limit);
    }

    // Fault alarm
    const hasFault = chargerStatus === 'faulted';
    await this.safeSetCapabilityValue('alarm_fault', hasFault);

    // Fire triggers
    await this.handleTriggers(chargerStatus, wasCharging, power, status);

    // Adjust polling interval when charging state changes
    if (wasCharging !== this.isCharging) {
      this.restartPolling();
    }
  }

  private async handleTriggers(
    chargerStatus: string,
    wasCharging: boolean,
    power: number,
    status: VoltTimeChargerStatus,
  ): Promise<void> {
    const deviceName = this.getName();

    // Charging started
    if (this.isCharging && !wasCharging) {
      await this.homey.flow.getDeviceTriggerCard('charging_started')
        .trigger(this, { charger_name: deviceName })
        .catch(this.error);
    }

    // Charging stopped
    if (!this.isCharging && wasCharging) {
      const sessionEnergy = this.getCapabilityValue('meter_session_energy') || 0;
      await this.homey.flow.getDeviceTriggerCard('charging_stopped')
        .trigger(this, { charger_name: deviceName, session_energy: sessionEnergy })
        .catch(this.error);
    }

    // Charger status changed
    if (chargerStatus !== this.previousStatus && this.previousStatus !== 'unknown') {
      await this.homey.flow.getDeviceTriggerCard('charger_status_changed')
        .trigger(this, { old_status: this.previousStatus, new_status: chargerStatus })
        .catch(this.error);

      // Vehicle connected (transition to preparing)
      if (chargerStatus === 'preparing' && this.previousStatus === 'available') {
        await this.homey.flow.getDeviceTriggerCard('charger_connected')
          .trigger(this, { charger_name: deviceName })
          .catch(this.error);
      }

      // Vehicle disconnected (transition to available from non-available)
      if (chargerStatus === 'available' && this.previousStatus !== 'available' && this.previousStatus !== 'unknown') {
        await this.homey.flow.getDeviceTriggerCard('charger_disconnected')
          .trigger(this, { charger_name: deviceName })
          .catch(this.error);
      }
    }
    this.previousStatus = chargerStatus;

    // Fault detected
    if (chargerStatus === 'faulted' && this.previousStatus !== 'faulted') {
      const faultText = status.fault || 'Unknown fault';
      await this.homey.flow.getDeviceTriggerCard('fault_detected')
        .trigger(this, { fault_text: faultText })
        .catch(this.error);
    }

    // Power changed (with deadband)
    if (Math.abs(power - this.previousPower) >= POWER_CHANGE_DEADBAND) {
      await this.homey.flow.getDeviceTriggerCard('power_changed')
        .trigger(this, { power, previous_power: this.previousPower })
        .catch(this.error);
      this.previousPower = power;
    }

    // Charge limit changed
    const currentLimit = status.current_limit || 0;
    if (currentLimit !== this.previousChargeLimit && this.previousChargeLimit > 0) {
      await this.homey.flow.getDeviceTriggerCard('charge_limit_changed')
        .trigger(this, { new_limit: currentLimit, previous_limit: this.previousChargeLimit })
        .catch(this.error);
    }
    this.previousChargeLimit = currentLimit;
  }

  private async onCapabilityOnoff(value: boolean): Promise<void> {
    try {
      if (value) {
        await this.api.startCharging(this.chargerId, this.connectorId);
        this.log('Start charging command sent');
      } else {
        await this.api.stopCharging(this.chargerId, this.connectorId);
        this.log('Stop charging command sent');
      }
      // Refresh state after a short delay to allow the charger to process
      setTimeout(() => this.refreshState(), 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.error(`Failed to ${value ? 'start' : 'stop'} charging: ${message}`);
      throw new Error(`Failed to ${value ? 'start' : 'stop'} charging: ${message}`);
    }
  }

  private async onCapabilityTargetChargingCurrent(value: number): Promise<void> {
    const clamped = Math.max(6, Math.min(32, Math.round(value)));
    try {
      await this.api.setCurrentLimit(this.chargerId, this.connectorId, clamped);
      this.log(`Current limit set to ${clamped} A`);
      setTimeout(() => this.refreshState(), 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.error(`Failed to set current limit: ${message}`);
      throw new Error(`Failed to set current limit: ${message}`);
    }
  }

  async startChargingAction(): Promise<void> {
    await this.onCapabilityOnoff(true);
  }

  async stopChargingAction(): Promise<void> {
    await this.onCapabilityOnoff(false);
  }

  async setCurrentLimitAction(current: number): Promise<void> {
    await this.onCapabilityTargetChargingCurrent(current);
  }

  async refreshNowAction(): Promise<void> {
    await this.refreshState();
  }

  isDeviceCharging(): boolean {
    return this.isCharging;
  }

  isVehicleConnected(): boolean {
    const status = this.getCapabilityValue('charger_status');
    return status !== 'available' && status !== 'unavailable' && status !== 'unknown';
  }

  hasFault(): boolean {
    return this.getCapabilityValue('alarm_fault') === true;
  }

  getChargerStatus(): string {
    return this.getCapabilityValue('charger_status') || 'unknown';
  }

  getCurrentPower(): number {
    return this.getCapabilityValue('measure_power') || 0;
  }

  getCurrentLimit(): number {
    return this.getCapabilityValue('target_charging_current') || 0;
  }

  getApi(): VoltTimeApi {
    return this.api;
  }

  getChargerId(): string {
    return this.chargerId;
  }

  getConnectorId(): number {
    return this.connectorId;
  }

  private normalizeStatus(status: string | undefined): string {
    if (!status) return 'unknown';

    const normalized = status.toLowerCase().replace(/[\s-]/g, '_');

    const validStatuses = [
      'available', 'preparing', 'charging', 'suspended_ev', 'suspended_evse',
      'finishing', 'reserved', 'unavailable', 'faulted',
    ];

    if (validStatuses.includes(normalized)) {
      return normalized;
    }

    return 'unknown';
  }

  private clampValue(value: number | undefined | null, min: number): number {
    if (value === undefined || value === null || isNaN(value)) return min;
    return Math.max(min, value);
  }

  private roundValue(value: number, decimals: number): number {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }

  private async safeSetCapabilityValue(capability: string, value: unknown): Promise<void> {
    try {
      if (this.hasCapability(capability)) {
        const currentValue = this.getCapabilityValue(capability);
        if (currentValue !== value) {
          await this.setCapabilityValue(capability, value);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.error(`Failed to set capability ${capability}: ${message}`);
    }
  }

  compareValue(actual: number, operator: string, target: number): boolean {
    switch (operator) {
      case 'lt': return actual < target;
      case 'lte': return actual <= target;
      case 'gt': return actual > target;
      case 'gte': return actual >= target;
      default: return false;
    }
  }
}
