
# Volt Time Chargers — Device Capabilities and Flow Cards
## Homey app design document

App Name: Volt Time Chargers  
App ID: `com.volttime.chargers`  
Description: Control and monitor Volt Time EV chargers using Volt Time Cloud or OCPP.  
Date: 2026-03-08

---

# 1. Purpose

This document defines the recommended:

- device capabilities
- calculated capabilities
- Trigger cards
- Condition cards
- Action cards

for the **Volt Time Chargers** Homey app.

The initial target device is the **ALP Volt Time Source 2S**, but the design is intentionally generic enough for future Volt Time charger models.

---

# 2. Design principles

The capability and Flow design should aim for:

- clear Homey user experience
- strong support for automations
- good Homey Energy compatibility
- support for both Volt Time Cloud API and future OCPP mode
- a clean distinction between:
  - raw measured values
  - charger state
  - user control
  - derived or calculated values

---

# 3. Recommended device capabilities

## 3.1 Core device capabilities

These are the most important capabilities for the first release.

| Capability ID | Type | Unit | Purpose | Notes |
|---|---|---:|---|---|
| `onoff` | boolean | - | Start/stop charging | `true` while charging, `false` when not charging |
| `measure_power` | number | W | Live charging power | Important for Homey Energy and automations |
| `meter_power` | number | kWh | Total imported energy | Should be cumulative, not session-only |
| `measure_current` | number | A | Live charging current | Total charging current |
| `measure_voltage` | number | V | Live charging voltage | Prefer actual measured voltage |
| `charger_status` | enum/custom | - | Main charger state | Such as available, preparing, charging, faulted |
| `connector_status` | enum/custom | - | Connector / cable state | Such as connected, disconnected, locked |
| `alarm_fault` | boolean | - | Charger fault present | Useful in dashboards and Flows |
| `alarm_generic` | boolean | - | Generic warning state | Optional but useful for non-fault warnings |
| `measure_temperature` | number | °C | Charger temperature | Only if available from API/OCPP |
| `measure_battery` | number | % | Vehicle SoC | Only if exposed by charger / protocol |
| `target_charging_current` | number | A | Configured charging current limit | Useful for control visibility |
| `meter_session_energy` | number | kWh | Current session energy | Custom capability, not a replacement for `meter_power` |
| `meter_session_duration` | number | min | Current session duration | Helpful for dashboards and charging history |
| `last_seen` | text/custom | - | Last successful update time | Helpful for troubleshooting |
| `protocol_version` | text/custom | - | Active integration mode / protocol | Example: Cloud API, OCPP 1.6J, OCPP 2.0.1 |

## 3.2 Status values

Suggested `charger_status` values:

| Value | Meaning |
|---|---|
| `available` | Charger is ready and idle |
| `preparing` | Cable connected / preparing to charge |
| `charging` | Active charging session |
| `suspended_ev` | EV paused charging |
| `suspended_evse` | Charger/EVSE paused charging |
| `finishing` | Session is ending |
| `reserved` | Charger reserved |
| `unavailable` | Charger not available |
| `faulted` | Charger fault active |
| `unknown` | Status not known |

Suggested `connector_status` values:

| Value | Meaning |
|---|---|
| `disconnected` | No cable / no vehicle connected |
| `connected` | Cable or vehicle connected |
| `locked` | Connector/cable locked |
| `unlocked` | Connector/cable unlocked |
| `unknown` | Unknown connector state |

---

# 4. Calculated capabilities that may be handy

Calculated capabilities are not raw charger values.  
They are derived from measurements, charger state, or timing.

These can make the app much more useful.

## 4.1 Recommended calculated capabilities

| Capability ID | Type | Unit | Calculation | Why it is useful |
|---|---|---:|---|---|
| `measure_power_kw` | number | kW | `measure_power / 1000` | Easier to read in dashboards and flows |
| `measure_current_per_phase` | number | A | `measure_current / phase_count` when known | Useful for 3-phase diagnostics |
| `measure_power_per_phase` | number | W | `measure_power / phase_count` when known | Handy for diagnostics |
| `charge_rate_kwh_per_hour` | number | kWh/h | derived from live power | User-friendly equivalent of charging speed |
| `estimated_session_cost` | number | currency | `session_energy × tariff` | Very useful when dynamic tariffs are available |
| `estimated_time_to_target` | number | min | derived from SoC, target SoC and power | Useful when vehicle SoC is available |
| `session_average_power` | number | W | `session_energy / session_duration` | Useful for performance insight |
| `session_peak_power` | number | W | max of power during session | Good for diagnostics |
| `energy_added_today` | number | kWh | delta in cumulative energy since midnight | Handy for daily reporting |
| `energy_added_this_session` | number | kWh | session energy counter | Useful for notifications and reports |
| `grid_surplus_used` | number | W or % | calculated from house export and charger power | Very useful for solar surplus charging |
| `is_solar_charging` | boolean | - | charger active while export logic enabled | Helpful for Flows |
| `is_dynamic_limited` | boolean | - | true when app is adjusting current automatically | Good for automation visibility |
| `current_limit_headroom` | number | A | `max_allowed - current_limit` | Helpful for advanced diagnostics |
| `time_since_last_update` | number | s | now minus last update time | Useful to detect stale telemetry |
| `availability_score` | number | % | based on successful polling over time | Helpful for long-term reliability insight |

## 4.2 Most useful calculated capabilities for a first useful release

If you only add a few calculated capabilities, these are the best ones:

| Capability | Priority | Why |
|---|---|---|
| `measure_power_kw` | High | Much easier for users to read than watts in some dashboards |
| `energy_added_today` | High | Very practical for daily usage monitoring |
| `energy_added_this_session` | High | Great for charge-session automations and insights |
| `session_peak_power` | Medium | Useful for diagnostics |
| `estimated_session_cost` | Medium | Very user-friendly when tariff data exists |
| `is_solar_charging` | Medium | Very helpful for smart charging automations |
| `time_since_last_update` | Medium | Great for reliability / stale data detection |

## 4.3 Calculated capability notes

- Use calculated capabilities only when the source data is reliable enough.
- Do not present estimates as exact values unless they are based on trusted meter data.
- Keep cumulative energy and session energy clearly separated.
- If a value depends on external Homey data, such as tariff or solar export, document that clearly.

---

# 5. Recommended Trigger cards

These cards fire when something happens.

## 5.1 Core Trigger cards

| Trigger card ID | Title | Tokens / arguments | Why it is useful |
|---|---|---|---|
| `charging_started` | Charging started | charger name | Essential session automation trigger |
| `charging_stopped` | Charging stopped | charger name, session energy | Essential session automation trigger |
| `charger_connected` | Vehicle connected | charger name | Useful for start logic and notifications |
| `charger_disconnected` | Vehicle disconnected | charger name | Useful for end-of-session logic |
| `charger_status_changed` | Charger status changed | old status, new status | Important general state trigger |
| `fault_detected` | Fault detected | fault text if available | Important alerting trigger |
| `fault_cleared` | Fault cleared | - | Good for alert recovery |
| `power_changed` | Power has changed | current power, previous power | Matches your preferred trigger style |
| `current_changed` | Current has changed | current, previous current | Useful for diagnostics |
| `voltage_changed` | Voltage has changed | voltage, previous voltage | Useful for diagnostics |
| `charge_limit_changed` | Charge limit has changed | new limit, previous limit | Useful when automation changes current |
| `session_energy_changed` | Session energy has changed | current session energy | Useful, but should be rate-limited |
| `session_target_reached` | Session target reached | target value | For future target-based charging |
| `telemetry_became_stale` | Charger data became stale | last seen time | Good reliability trigger |
| `telemetry_restored` | Charger data was restored | - | Good for recovery notifications |
| `solar_charging_started` | Solar charging started | - | Useful in smart charging mode |
| `solar_charging_stopped` | Solar charging stopped | - | Useful in smart charging mode |

## 5.2 Threshold-style Trigger cards

These are especially useful in Homey.

| Trigger card ID | Title | Arguments | Notes |
|---|---|---|---|
| `power_became` | Power became [condition] [value] | condition, value | Fires on threshold crossing |
| `current_became` | Current became [condition] [value] | condition, value | Fires on threshold crossing |
| `voltage_became` | Voltage became [condition] [value] | condition, value | Fires on threshold crossing |
| `session_energy_became` | Session energy became [condition] [value] | condition, value | Useful for milestones |
| `total_energy_became` | Total energy became [condition] [value] | condition, value | Less common but possible |
| `temperature_became` | Temperature became [condition] [value] | condition, value | Only if temperature exists |

### Recommended supported conditions

For threshold-style cards:

| Condition token | Meaning |
|---|---|
| `lt` | Less Than |
| `lte` | Less Than or Equal |
| `gt` | Greater Than |
| `gte` | Greater Than or Equal |

## 5.3 Trigger cards I would prioritize first

| Priority | Trigger card |
|---|---|
| High | `charging_started` |
| High | `charging_stopped` |
| High | `power_changed` |
| High | `charger_status_changed` |
| High | `fault_detected` |
| Medium | `charger_connected` |
| Medium | `charger_disconnected` |
| Medium | `charge_limit_changed` |
| Medium | `telemetry_became_stale` |
| Later | threshold-style triggers |

---

# 6. Recommended Condition cards

These cards are used in the **And...** column of a Flow.

## 6.1 Core Condition cards

| Condition card ID | Title | Arguments | Why it is useful |
|---|---|---|---|
| `is_charging` | Charger is charging | - | Essential |
| `is_connected` | Vehicle is connected | - | Essential |
| `has_fault` | Charger has a fault | - | Essential |
| `is_available` | Charger is available | - | Useful for start conditions |
| `is_solar_charging` | Charger is using solar surplus | - | Useful for smart charging |
| `is_dynamic_limited` | Charger is dynamically limited | - | Useful for smart charging |
| `protocol_is` | Protocol is [value] | protocol | Useful for debugging and advanced setups |
| `status_is` | Charger status is [value] | status | More specific than boolean checks |
| `connector_status_is` | Connector status is [value] | connector status | Useful for cable-related logic |
| `telemetry_is_fresh` | Charger telemetry is fresh | max age | Useful for safe automation |
| `charge_limit_is` | Charge limit is [condition] [value] | condition, value | Very useful for current-limit automations |

## 6.2 Value comparison Condition cards

These match your preferred pattern.

### Power condition card

| Condition card ID | Title | Arguments | Example |
|---|---|---|---|
| `power_is` | Power is [condition] [value] | condition, value | Power is `gt` `3000` |

### Current condition card

| Condition card ID | Title | Arguments | Example |
|---|---|---|---|
| `current_is` | Current is [condition] [value] | condition, value | Current is `gte` `6` |

### Voltage condition card

| Condition card ID | Title | Arguments | Example |
|---|---|---|---|
| `voltage_is` | Voltage is [condition] [value] | condition, value | Voltage is `lt` `210` |

### Session energy condition card

| Condition card ID | Title | Arguments | Example |
|---|---|---|---|
| `session_energy_is` | Session energy is [condition] [value] | condition, value | Session energy is `gte` `10` |

### Total energy condition card

| Condition card ID | Title | Arguments | Example |
|---|---|---|---|
| `total_energy_is` | Total energy is [condition] [value] | condition, value | Total energy is `gt` `1000` |

### Temperature condition card

| Condition card ID | Title | Arguments | Example |
|---|---|---|---|
| `temperature_is` | Temperature is [condition] [value] | condition, value | Temperature is `gte` `60` |

### Time-since-update condition card

| Condition card ID | Title | Arguments | Example |
|---|---|---|---|
| `time_since_update_is` | Time since last update is [condition] [value] | condition, value | Time since last update is `lt` `120` |

## 6.3 Supported comparison conditions

| Condition token | Label |
|---|---|
| `lt` | Less Than |
| `lte` | Less Than or Equal |
| `gt` | Greater Than |
| `gte` | Greater Than or Equal |

## 6.4 Condition cards I would prioritize first

| Priority | Condition card |
|---|---|
| High | `is_charging` |
| High | `is_connected` |
| High | `power_is` |
| High | `status_is` |
| High | `has_fault` |
| Medium | `current_is` |
| Medium | `charge_limit_is` |
| Medium | `telemetry_is_fresh` |
| Later | `temperature_is`, `session_energy_is` |

---

# 7. Recommended Action cards

These cards do something.

## 7.1 Core Action cards

| Action card ID | Title | Arguments | Why it is useful |
|---|---|---|---|
| `start_charging` | Start charging | - | Essential |
| `stop_charging` | Stop charging | - | Essential |
| `toggle_charging` | Toggle charging | - | Convenient |
| `set_current_limit` | Set current limit to [value] A | value | Essential for smart charging |
| `increase_current_limit` | Increase current limit by [value] A | value | Useful for incremental control |
| `decrease_current_limit` | Decrease current limit by [value] A | value | Useful for incremental control |
| `set_charge_mode` | Set charge mode to [value] | mode | For future manual / smart / schedule modes |
| `set_solar_mode` | Enable solar surplus mode | enabled/disabled | Useful in advanced versions |
| `set_target_energy` | Set target session energy to [value] kWh | value | Future feature |
| `set_target_soc` | Set target vehicle SoC to [value] % | value | Future feature if supported |
| `refresh_now` | Refresh charger data now | - | Very useful diagnostic action |
| `clear_fault_state` | Clear fault / acknowledge warning | - | Only if supported by charger/protocol |
| `set_polling_profile` | Set polling profile to [value] | profile | Useful for diagnostics or power users |

## 7.2 Handy advanced Action cards

| Action card ID | Title | Arguments | Why it is useful |
|---|---|---|---|
| `set_ready_by_time` | Set ready-by time to [time] | time | For future schedule optimization |
| `charge_now_override` | Set charge-now override to [value] | on/off | Great with tariff logic |
| `set_min_current_limit` | Set minimum dynamic current to [value] A | value | Useful for solar mode |
| `set_max_current_limit` | Set maximum dynamic current to [value] A | value | Useful for solar mode |
| `pause_smart_charging` | Pause smart charging | - | Helpful user control |
| `resume_smart_charging` | Resume smart charging | - | Helpful user control |
| `lock_connector` | Lock connector | - | Only if charger supports it |
| `unlock_connector` | Unlock connector | - | Only if charger supports it |

## 7.3 Action cards I would prioritize first

| Priority | Action card |
|---|---|
| High | `start_charging` |
| High | `stop_charging` |
| High | `set_current_limit` |
| High | `refresh_now` |
| Medium | `increase_current_limit` |
| Medium | `decrease_current_limit` |
| Later | smart-charging and scheduling actions |

---

# 8. Recommended MVP set

If the goal is a strong first release without too much complexity, this is the set I would ship first.

## 8.1 MVP device capabilities

| Capability |
|---|
| `onoff` |
| `measure_power` |
| `meter_power` |
| `measure_current` |
| `measure_voltage` |
| `charger_status` |
| `connector_status` |
| `alarm_fault` |
| `target_charging_current` |
| `meter_session_energy` |

## 8.2 MVP Trigger cards

| Trigger card |
|---|
| `charging_started` |
| `charging_stopped` |
| `power_changed` |
| `charger_status_changed` |
| `fault_detected` |

## 8.3 MVP Condition cards

| Condition card |
|---|
| `is_charging` |
| `is_connected` |
| `has_fault` |
| `status_is` |
| `power_is` |

## 8.4 MVP Action cards

| Action card |
|---|
| `start_charging` |
| `stop_charging` |
| `set_current_limit` |
| `refresh_now` |

---

# 9. Recommended implementation notes

## 9.1 About custom capabilities

The following will probably need custom capabilities:

- `charger_status`
- `connector_status`
- `meter_session_energy`
- `target_charging_current`
- any calculated capability like `energy_added_today`

## 9.2 About threshold comparison cards

For your preferred pattern:

- **Trigger:** `Power has changed`
- **Condition:** `Power is [condition] [value]`

I recommend implementing the comparison helper once and reusing it for:

- power
- current
- voltage
- session energy
- charge limit
- time since update

## 9.3 About noisy telemetry

To avoid too many Flow triggers:

- add deadbands where needed
- debounce rapid changes
- only fire threshold triggers when a threshold is crossed, not on every poll
- consider a minimum delta for `power_changed`

Example:
- only trigger `power_changed` if the difference is at least 100 W

## 9.4 About energy reporting

Keep these clearly separated:

- **live power** → `measure_power`
- **total imported energy** → `meter_power`
- **session energy** → `meter_session_energy`

This avoids confusion in Homey Energy and in Flows.

---

# 10. Final recommendation

For the **Volt Time Chargers** app, the best design is:

- a small but strong **MVP** first
- include the comparison-style Condition cards you prefer
- start with raw charger measurements plus a few practical calculated capabilities
- expand later with smart charging, scheduling, and richer session analytics

The most useful comparison-style Condition cards to add first are:

- `Power is [condition] [value]`
- `Current is [condition] [value]`
- `Charge limit is [condition] [value]`
- `Time since last update is [condition] [value]`

And the most useful calculated capabilities to add early are:

- `energy_added_this_session`
- `energy_added_today`
- `measure_power_kw`
- `time_since_last_update`
