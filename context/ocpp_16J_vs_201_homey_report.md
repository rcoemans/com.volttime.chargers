
# OCPP 1.6J vs OCPP 2.0.1 Comparison Report
## For the Homey App: Volt Time Chargers (com.volttime.chargers)

Date: 2026-03-08

---

# 1. Purpose of this report

This report compares OCPP 1.6J and OCPP 2.0.1 with the goal of identifying:

- protocol differences
- new capabilities introduced in OCPP 2.0.1
- which differences can be used to improve a Homey integration
- how these differences affect:
  - device capabilities
  - Trigger cards
  - Condition cards
  - Action cards
  - Insights
  - other Homey app functionality

Volt Time chargers support:

- OCPP 1.6J
- OCPP 2.0.1

---

# 2. High‑level architecture differences

| Feature | OCPP 1.6J | OCPP 2.0.1 |
|---|---|---|
Protocol transport | JSON over WebSocket | JSON over WebSocket |
Architecture | Simple message model | Component-based architecture |
Device model | Charger-level | Component + variable model |
Security | Basic | Certificate-based |
Smart charging | Limited | Advanced multi-level |
ISO 15118 | Not supported | Supported |
Diagnostics | Basic | Extensive |
Telemetry | Simple meter values | Event + measurement system |
Extensibility | Limited | High |

### Homey impact

OCPP 2.0.1 allows:

- richer device capabilities
- more Trigger cards
- better Insights data
- improved smart charging automation

---

# 3. Core protocol message comparison

| Function | OCPP 1.6J Message | OCPP 2.0.1 Equivalent |
|---|---|---|
Charger boot | BootNotification | BootNotification |
Status update | StatusNotification | StatusNotification |
Meter reporting | MeterValues | MeterValues |
Start charging | StartTransaction | TransactionEvent |
Stop charging | StopTransaction | TransactionEvent |
Remote start | RemoteStartTransaction | RequestStartTransaction |
Remote stop | RemoteStopTransaction | RequestStopTransaction |
Diagnostics | DiagnosticsStatusNotification | NotifyEvent |
Firmware update | UpdateFirmware | UpdateFirmware |
Heartbeat | Heartbeat | Heartbeat |

### Homey opportunities

Both versions support the core features needed for:

- charging control
- power monitoring
- energy measurement

However OCPP 2.0.1 improves:

- event reporting
- diagnostics
- transaction information

This enables richer Homey functionality.

---

# 4. Charger device model differences

| Feature | OCPP 1.6J | OCPP 2.0.1 |
|---|---|---|
Device structure | Flat | Component-based |
Configuration | Key/value | Variables |
Diagnostics | Limited | Detailed |
Monitoring | Basic | Advanced |
Events | Limited | Extensive |

### Homey enhancement opportunities

Possible new device capabilities when using OCPP 2.0.1:

| Capability | Reason |
|---|---|
Charger temperature | Available via component variables |
Connector lock state | Exposed as device variable |
Smart charging state | Available from charging profile |
Plug & Charge status | From ISO15118 integration |
Charging schedule | Available via smart charging profiles |

---

# 5. Smart charging improvements

| Feature | OCPP 1.6J | OCPP 2.0.1 |
|---|---|---|
Charging profiles | Basic | Advanced |
Dynamic load balancing | Limited | Native |
Energy management | Limited | Built-in |
Tariff awareness | Limited | Supported |
DER integration | No | Yes |

### Homey smart charging opportunities

New Action cards enabled by OCPP 2.0.1:

| Action card | Description |
|---|---|
Set charging profile | Set smart charging schedule |
Set power limit | Dynamic charging current |
Enable smart charging | Switch to optimized charging |
Set target energy | Stop charging after X kWh |
Set target time | Ready-by charging |

---

# 6. Telemetry and measurement improvements

| Feature | OCPP 1.6J | OCPP 2.0.1 |
|---|---|---|
Meter values | Periodic | Event-based |
Measurement types | Limited | Extensive |
Telemetry granularity | Low | High |
Event notifications | Minimal | Rich |

### Homey Insights opportunities

Possible Insights data streams:

- charging power
- charging current
- energy delivered
- voltage
- session duration
- charger temperature

---

# 7. Transaction handling

| Feature | OCPP 1.6J | OCPP 2.0.1 |
|---|---|---|
Transactions | Start/Stop | Event-based |
Session tracking | Limited | Detailed |
Charging states | Simple | Detailed |
Transaction metadata | Minimal | Rich |

### Homey improvements

Possible new Trigger cards:

| Trigger | Description |
|---|---|
Charging session started | Transaction start |
Charging session stopped | Transaction end |
Session energy milestone reached | Example: 10 kWh |
Charging paused | EV paused charging |
Charging resumed | Charging continues |

---

# 8. Security improvements

| Feature | OCPP 1.6J | OCPP 2.0.1 |
|---|---|---|
Encryption | TLS optional | Mandatory TLS |
Certificates | No | Yes |
Secure firmware | Limited | Full support |

---

# 9. Diagnostics and maintenance

| Feature | OCPP 1.6J | OCPP 2.0.1 |
|---|---|---|
Error reporting | Basic | Detailed |
Component monitoring | No | Yes |
Self diagnostics | Limited | Advanced |

### Homey enhancements

Possible Trigger cards:

| Trigger | Description |
|---|---|
Charger fault detected | Hardware fault |
Charger fault cleared | Fault resolved |
Maintenance required | Charger indicates service needed |

Possible Condition cards:

| Condition | Description |
|---|---|
Charger health is OK | No diagnostics errors |
Charger temperature is high | Prevent overheating |

---

# 10. Recommended Homey capability enhancements

When using OCPP 2.0.1:

| Capability | Type | Description |
|---|---|---|
charger_temperature | measure_temperature | Charger thermal monitoring |
session_energy | meter | Energy this session |
session_duration | measure_duration | Charging time |
charging_profile | enum | Current charging mode |
plug_and_charge | boolean | ISO15118 active |
charge_schedule_active | boolean | Smart charging active |

---

# 11. Recommended Flow cards

## Trigger cards

| Trigger |
|---|
Charging session started |
Charging session stopped |
Power has changed |
Session energy reached |
Charger fault detected |
Charging paused |
Charging resumed |

## Condition cards

| Condition |
|---|
Power is [condition] [value] |
Current is [condition] [value] |
Voltage is [condition] [value] |
Session energy is [condition] [value] |
Charger temperature is [condition] [value] |

Supported comparison operators:

- lt
- lte
- gt
- gte

## Action cards

| Action |
|---|
Start charging |
Stop charging |
Set current limit |
Set charging profile |
Set target energy |
Refresh charger data |

---

# 12. Summary

| Aspect | OCPP 1.6J | OCPP 2.0.1 |
|---|---|---|
Complexity | Low | High |
Features | Basic | Advanced |
Smart charging | Limited | Strong |
Telemetry | Basic | Detailed |
Homey integration potential | Good | Excellent |

### Final recommendation

Use **OCPP 2.0.1 whenever supported** because it unlocks:

- richer device capabilities
- more Flow triggers
- better Insights
- smarter charging automation
