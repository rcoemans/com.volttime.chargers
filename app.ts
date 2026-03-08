'use strict';

import Homey from 'homey';
import { ChargerBase } from './lib/chargerBase';

module.exports = class VoltTimeChargersApp extends Homey.App {

  /**
   * onInit is called when the app is initialized.
   */
  async onInit() {
    this.log('Volt Time Chargers app has been initialized');

    this.registerFlowCards();
  }

  private registerFlowCards(): void {
    // ── Condition cards ──

    this.homey.flow.getConditionCard('is_charging')
      .registerRunListener(async (args: { device: ChargerBase }) => {
        return args.device.isDeviceCharging();
      });

    this.homey.flow.getConditionCard('is_connected')
      .registerRunListener(async (args: { device: ChargerBase }) => {
        return args.device.isVehicleConnected();
      });

    this.homey.flow.getConditionCard('has_fault')
      .registerRunListener(async (args: { device: ChargerBase }) => {
        return args.device.hasFault();
      });

    this.homey.flow.getConditionCard('status_is')
      .registerRunListener(async (args: { device: ChargerBase; status: string }) => {
        return args.device.getChargerStatus() === args.status;
      });

    this.homey.flow.getConditionCard('power_is')
      .registerRunListener(async (args: { device: ChargerBase; operator: string; value: number }) => {
        return args.device.compareValue(args.device.getCurrentPower(), args.operator, args.value);
      });

    this.homey.flow.getConditionCard('is_available')
      .registerRunListener(async (args: { device: ChargerBase }) => {
        return args.device.isChargerAvailable();
      });

    this.homey.flow.getConditionCard('current_is')
      .registerRunListener(async (args: { device: ChargerBase; operator: string; value: number }) => {
        return args.device.compareValue(args.device.getCapabilityValue('measure_current') || 0, args.operator, args.value);
      });

    this.homey.flow.getConditionCard('charge_limit_is')
      .registerRunListener(async (args: { device: ChargerBase; operator: string; value: number }) => {
        return args.device.compareValue(args.device.getCurrentLimit(), args.operator, args.value);
      });

    this.homey.flow.getConditionCard('voltage_is')
      .registerRunListener(async (args: { device: ChargerBase; operator: string; value: number }) => {
        return args.device.compareValue(args.device.getVoltage(), args.operator, args.value);
      });

    this.homey.flow.getConditionCard('session_energy_is')
      .registerRunListener(async (args: { device: ChargerBase; operator: string; value: number }) => {
        return args.device.compareValue(args.device.getSessionEnergy(), args.operator, args.value);
      });

    this.homey.flow.getConditionCard('temperature_is')
      .registerRunListener(async (args: { device: ChargerBase; operator: string; value: number }) => {
        args.device.requireOcpp201('Temperature condition');
        return args.device.compareValue(args.device.getTemperature(), args.operator, args.value);
      });

    this.homey.flow.getConditionCard('is_smart_charging')
      .registerRunListener(async (args: { device: ChargerBase }) => {
        args.device.requireOcpp201('Smart charging condition');
        return args.device.isSmartChargingActive();
      });

    this.homey.flow.getConditionCard('charger_health_ok')
      .registerRunListener(async (args: { device: ChargerBase }) => {
        return args.device.isChargerHealthOk();
      });

    // ── Action cards ──

    this.homey.flow.getActionCard('start_charging')
      .registerRunListener(async (args: { device: ChargerBase }) => {
        await args.device.startChargingAction();
      });

    this.homey.flow.getActionCard('stop_charging')
      .registerRunListener(async (args: { device: ChargerBase }) => {
        await args.device.stopChargingAction();
      });

    this.homey.flow.getActionCard('toggle_charging')
      .registerRunListener(async (args: { device: ChargerBase }) => {
        await args.device.toggleChargingAction();
      });

    this.homey.flow.getActionCard('set_current_limit')
      .registerRunListener(async (args: { device: ChargerBase; current: number }) => {
        await args.device.setCurrentLimitAction(args.current);
      });

    this.homey.flow.getActionCard('increase_current_limit')
      .registerRunListener(async (args: { device: ChargerBase; value: number }) => {
        await args.device.increaseCurrentLimitAction(args.value);
      });

    this.homey.flow.getActionCard('decrease_current_limit')
      .registerRunListener(async (args: { device: ChargerBase; value: number }) => {
        await args.device.decreaseCurrentLimitAction(args.value);
      });

    this.homey.flow.getActionCard('set_target_energy')
      .registerRunListener(async (args: { device: ChargerBase; value: number }) => {
        await args.device.setTargetEnergyAction(args.value);
      });

    this.homey.flow.getActionCard('set_charging_profile_mode')
      .registerRunListener(async (args: { device: ChargerBase; mode: string }) => {
        await args.device.setChargingProfileModeAction(args.mode);
      });

    this.homey.flow.getActionCard('refresh_now')
      .registerRunListener(async (args: { device: ChargerBase }) => {
        await args.device.refreshNowAction();
      });

    this.log('Flow cards registered');
  }

};
