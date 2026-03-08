# Volt Time Chargers

[![Homey App](https://img.shields.io/badge/Homey-App%20Store-00A94F?logo=homey)](https://homey.app/en-nl/app/com.volttime.chargers/Volt-Time-Chargers/)
[![License: GPL-3.0](https://img.shields.io/badge/License-GPL--3.0-blue.svg)](LICENSE)

Homey app for **Volt Time EV chargers**. Communicates with chargers via the **Volt Time Cloud API** to read real-time charging data, monitor status, control charging sessions, and automate your EV charger directly from Homey.

## Disclaimer

> **This is an unofficial, community-developed integration.**
>
> - Not affiliated with, endorsed by, or supported by **Volt Time** or **ALP EV**.
> - Volt Time may change or discontinue their API at any time without notice — app functionality may break as a result.
> - Use at your own risk. The developers accept no liability for data loss, incorrect readings, or unintended charging behavior.

## Supported Devices

| Model                                      | Cloud API Support | Notes                    |
|--------------------------------------------|-------------------|--------------------------|
| ALP Volt Time Source 2S (FP-CH-SRC2S-BCB)  | ✅                | Primary supported device |
| Future Volt Time charger models            | 🔜                | Architecture is ready    |

## Requirements

- Volt Time charger connected to the internet
- **Volt Time Cloud account** with a **Personal Access Token**
- Network access from Homey to the Volt Time Cloud API

## Installation

### Via Homey App Store

Search for **"Volt Time Chargers"** in the Homey App Store.

### Via CLI (sideloading / development)

```bash
npm install -g homey
git clone https://github.com/rcoemans/com.volttime.chargers
cd com.volttime.chargers
npm install
homey login
homey app install
```

## Setup

1. Install the app on your Homey.
2. Add a new device: **Volt Time Chargers → Source 2S**.
3. Obtain your Plugchoice API token (see **How to obtain your Plugchoice API token** below).
4. Select your charger from the discovered list.
5. The device will connect automatically and start reading data.
6. You can change connection settings later in the device **Settings** page.

## How to obtain your Plugchoice API token

To connect your charger to this Homey app, you need to create an API token in your Plugchoice account.

### Step 1 — Log in to Plugchoice

- Open the Plugchoice web portal: [https://app.plugchoice.com](https://app.plugchoice.com)
- Sign in with your Volt Time / Plugchoice account.

### Step 2 — Open account settings

- Click your name in the bottom-left corner.
- Open your account/profile settings.

### Step 3 — Create a token

- Go to the **API Tokens** section in your profile settings.
- Create a new API token / Personal Access Token.

### Step 4 — Copy the token

- Copy the generated token value.
- ⚠️ Copy this token immediately if shown only once.

### Step 5 — Enter the token in Homey

- Open the Volt Time Chargers app settings in Homey.
- Paste the token into the API Token field.
- Save the settings.

The app uses this value as a Bearer token and will automatically discover your chargers.

**Short UI help text:**
Create your token in Plugchoice Web Portal -> click your name bottom-left -> Account Settings -> API Tokens.

## Device Controls & Variables

### On/Off button — Start / Stop Charging

The **Charging** toggle button in the device view starts or stops an active charging session:

- **ON** — sends a Remote Start Transaction command to the charger via the Volt Time Cloud API. The charger will begin a charging session on the configured connector.
- **OFF** — sends a Remote Stop Transaction command. The charger will end the current charging session.

> This button controls the active charging state. It does **not** control power to the charger hardware itself.

### Charging Current Limit slider

The **Charging current limit** slider (6–32 A) sets the maximum charging current the charger is allowed to deliver:

- Drag the slider to a value between **6 A** (minimum safe EVSE current) and **32 A** (maximum).
- The value is sent immediately to the charger via the Volt Time Cloud API.
- Lowering the limit reduces charging speed and power draw — useful for solar surplus charging or avoiding grid overload.
- Raising the limit allows faster charging up to the hardware maximum.

### All device capabilities

| Variable                   | Type    | Description                          | OCPP    | Indicator |
|----------------------------|---------|--------------------------------------|---------|:---------:|
| `onoff`                    | boolean | Charging active — start/stop session | Both    | ✓         |
| `measure_power`            | number  | Live charging power (W)              | Both    | ✓         |
| `meter_power`              | number  | Total imported energy (kWh)          | Both    |           |
| `measure_current`          | number  | Live charging current (A)            | Both    | ✓         |
| `measure_voltage`          | number  | Live charging voltage (V)            | Both    | ✓         |
| `charger_status`           | enum    | Charger status                       | Both    |           |
| `connector_status`         | enum    | Connector / cable status             | Both    |           |
| `alarm_fault`              | boolean | Charger fault active                 | Both    | ✓         |
| `target_charging_current`  | number  | Charging current limit (A) — slider  | Both    |           |
| `meter_session_energy`     | number  | Current session energy (kWh)         | Both    | ✓         |
| `charger_health`           | boolean | Charger health OK (no faults, safe temp) | Both | ✓        |
| `measure_temperature`      | number  | Charger temperature (°C)             | 2.0.1   | ✓         |
| `charging_profile_mode`    | enum    | Charging profile (default/smart/scheduled) | 2.0.1 | ✓     |
| `plug_and_charge`          | boolean | Plug & Charge (ISO 15118) active     | 2.0.1   | ✓         |
| `charge_schedule_active`   | boolean | Smart charging schedule active       | 2.0.1   | ✓         |

> - **`charger_health`** is a base capability visible on the dashboard for all OCPP versions. With OCPP 1.6J it checks for faults only; with OCPP 2.0.1 it also verifies charger temperature is within safe range.
> - **OCPP 2.0.1 capabilities** are automatically added to the dashboard when you select OCPP 2.0.1 in device settings, and removed when you switch back to OCPP 1.6J.

## Charger Status Values

| Status          | Meaning                          |
|-----------------|----------------------------------|
| Available       | Charger is ready and idle        |
| Preparing       | Cable connected, preparing       |
| Charging        | Active charging session          |
| Suspended (EV)  | EV paused charging               |
| Suspended (EVSE)| Charger paused charging          |
| Finishing       | Session is ending                |
| Reserved        | Charger reserved                 |
| Unavailable     | Charger not available            |
| Faulted         | Charger fault active             |

## Flow Cards

### Triggers (WHEN…)

| Trigger                    | OCPP  | Description                                                              |
|----------------------------|-------|--------------------------------------------------------------------------|
| Charging started           | Both  | Fires when a charging session starts. Provides charger name as token.    |
| Charging stopped           | Both  | Fires when a charging session stops. Provides charger name and session energy. |
| Charger status changed     | Both  | Fires when the charger status changes. Provides old and new status.      |
| Power has changed          | Both  | Fires when charging power changes significantly (100 W deadband).        |
| Fault detected             | Both  | Fires when the charger reports a fault.                                  |
| Fault cleared              | Both  | Fires when a charger fault is resolved.                                  |
| Vehicle connected          | Both  | Fires when a vehicle is connected to the charger.                        |
| Vehicle disconnected       | Both  | Fires when a vehicle is disconnected from the charger.                   |
| Charge limit has changed   | Both  | Fires when the charging current limit changes.                           |
| Charging paused            | Both  | Fires when charging is paused by EV or EVSE. Provides pause reason.      |
| Charging resumed           | Both  | Fires when a paused charging session resumes.                            |

### Conditions (AND…)

| Condition                                               | OCPP  | Description                                                      |
|---------------------------------------------------------|-------|------------------------------------------------------------------|
| Charger is / is not charging                            | Both  | Checks if the charger is currently charging                      |
| Vehicle is / is not connected                           | Both  | Checks if a vehicle is connected                                 |
| Charger has / has no fault                              | Both  | Checks if the charger has an active fault                        |
| Charger is / is not available                           | Both  | Checks if the charger is idle and ready for a new session        |
| Charger status is / is not [status]                     | Both  | Checks if the status matches a selected value                    |
| Power is / is not [operator] [value] W                  | Both  | Checks if the charging power matches the condition               |
| Charging current is / is not [operator] [value] A       | Both  | Checks if the live charging current matches the condition        |
| Charge limit is / is not [operator] [value] A           | Both  | Checks if the configured current limit matches the condition     |
| Voltage is / is not [operator] [value] V                | Both  | Checks if the charging voltage matches the condition             |
| Session energy is / is not [operator] [value] kWh       | Both  | Checks if the session energy matches the condition               |
| Charger temperature is / is not [operator] [value] °C   | 2.0.1 | Checks if charger temperature matches the condition              |
| Smart charging is / is not active                       | 2.0.1 | Checks if a smart charging profile is active                     |
| Charger health is / is not OK                           | Both* | Checks no faults and temperature within safe range               |

> \* `Charger health` works with both OCPP versions but provides richer diagnostics with OCPP 2.0.1 (temperature data).

### Actions (THEN…)

| Action                                  | OCPP  | Description                                                        |
|-----------------------------------------|-------|--------------------------------------------------------------------|
| Start charging                          | Both  | Starts a charging session on the charger                           |
| Stop charging                           | Both  | Stops the current charging session                                 |
| Toggle charging on/off                  | Both  | Starts if stopped, stops if active                                 |
| Set current limit to [value] A          | Both  | Sets the charging current limit (6–32 A)                           |
| Increase current limit by [value] A     | Both  | Increases the current limit by the given amount (max 32 A)         |
| Decrease current limit by [value] A     | Both  | Decreases the current limit by the given amount (min 6 A)          |
| Stop charging after [value] kWh         | Both  | Sets a session energy target; charging stops when reached          |
| Set charging profile (OCPP 2.0.1)       | 2.0.1 | Sets the smart charging profile mode (default/smart/scheduled)     |
| Refresh charger data now                | Both  | Immediately refreshes all charger data from the API                |

### Flow Card Variables (Tokens)

| Flow Card              | Token            | Type   | Description                | Example          |
|------------------------|------------------|--------|----------------------------|------------------|
| Charging started       | `charger_name`   | string | Charger device name        | Driveway Charger |
| Charging stopped       | `charger_name`   | string | Charger device name        | Driveway Charger |
| Charging stopped       | `session_energy` | number | Session energy (kWh)       | 12.5             |
| Status changed         | `old_status`     | string | Previous status            | available        |
| Status changed         | `new_status`     | string | New status                 | charging         |
| Power has changed      | `power`          | number | Current power (W)          | 7400             |
| Power has changed      | `previous_power` | number | Previous power (W)         | 3700             |
| Fault detected         | `fault_text`     | string | Fault description          | Ground fault     |
| Fault cleared          | `charger_name`   | string | Charger device name        | Driveway Charger |
| Charge limit changed   | `new_limit`      | number | New limit (A)              | 16               |
| Charge limit changed   | `previous_limit` | number | Previous limit (A)         | 32               |
| Charging paused        | `charger_name`   | string | Charger device name        | Driveway Charger |
| Charging paused        | `pause_reason`   | string | Pause reason               | EV requested     |
| Charging resumed       | `charger_name`   | string | Charger device name        | Driveway Charger |

## Homey Energy

The charger integrates with Homey Energy by reporting:

- **Live power** via `measure_power` (W)
- **Total imported energy** via `meter_power` (kWh)
- **Charging state** via `onoff`

The device is marked as a cumulative energy device for accurate Energy dashboard reporting.

## OCPP Protocol Version

Volt Time chargers support both **OCPP 1.6J** and **OCPP 2.0.1**. The protocol version can be selected in device settings.

| Feature                   | OCPP 1.6J            | OCPP 2.0.1                              |
|---------------------------|----------------------|-----------------------------------------|
| Core charging control     | ✓                    | ✓                                       |
| Power / current / voltage | ✓                    | ✓                                       |
| Energy tracking           | ✓                    | ✓                                       |
| Charger temperature       | ✗                    | ✓ (via component variables)             |
| Smart charging profiles   | Limited              | Advanced (multi-level)                  |
| Plug & Charge (ISO 15118) | ✗                    | ✓                                       |
| Diagnostics               | Basic                | Detailed (NotifyEvent)                  |

- **Default**: OCPP 1.6J (used during initial device installation)
- **Switching**: Go to device settings → OCPP protocol version → select 2.0.1
- **Capabilities**: OCPP 2.0.1-only capabilities are automatically added or removed when you change the setting
- **Flow cards**: OCPP 2.0.1-only flow cards will show an error if the device is set to OCPP 1.6J

## Device Settings

| Setting                         | Default   | Description                                                |
|---------------------------------|-----------|------------------------------------------------------------|
| Personal Access Token           | —         | Volt Time Cloud personal access token (required)           |
| OCPP protocol version           | 1.6J      | OCPP version your charger uses (1.6J or 2.0.1)            |
| Connector ID                    | 1         | Connector number on the charger                            |
| Polling interval (idle)         | 60 s      | How often to poll when not charging                        |
| Polling interval (charging)     | 10 s      | How often to poll during active charging                   |

## Use Case Examples

### Charge notification

- **WHEN** Charging stopped → **THEN** Send notification: "Charging complete — {{session_energy}} kWh added"

### Fault alerting

- **WHEN** Fault detected → **THEN** Send notification: "Charger fault: {{fault_text}}"

### Solar surplus charging

- **WHEN** Solar export > 1500 W **AND** Vehicle is connected **AND** Charger is available → **THEN** Start charging
- **WHEN** Solar export < 500 W **AND** Charger is charging → **THEN** Stop charging
- **WHEN** Power has changed **AND** Charging current is not greater than 32 A → **THEN** Increase current limit by 1 A

### Dynamic current control

- **WHEN** Electricity price is low → **THEN** Set current limit to 32 A
- **WHEN** Electricity price is high **AND** Charger is charging → **THEN** Decrease current limit by 4 A
- **WHEN** Electricity price is very high → **THEN** Stop charging

### Charge limit automation

- **WHEN** Charge limit has changed **AND** Charge limit is less than 8 A → **THEN** Send notification: "Charge limit reduced to {{new_limit}} A"
- **WHEN** Current has changed **AND** Charging current is greater than 28 A → **THEN** Send notification: "High current charging active"

## Architecture

The app uses a protocol abstraction architecture designed for future expansion:

```
com.volttime.chargers/
├── lib/
│   ├── api/
│   │   └── voltTimeApi.ts       # Volt Time Cloud API client
│   └── chargerBase.ts           # Shared device base class
├── drivers/
│   └── source2s/
│       ├── driver.ts            # Pairing and discovery
│       └── device.ts            # Device implementation
└── app.ts                       # Flow card registration
```

Future expansion paths:
- Additional Volt Time charger models
- Smart charging algorithms (solar surplus, tariff optimization)
- Local OCPP direct connection (without cloud)

## Known Limitations

| Limitation                  | Description                                                                |
|-----------------------------|----------------------------------------------------------------------------|
| **Cloud API only**          | Currently requires internet — local OCPP support planned for future.       |
| **Personal Access Token**   | OAuth sign-in planned for a future release.                                |
| **Single connector**        | Multi-connector support via settings, but pairing defaults to connector 1. |
| **Re-pair after updates**   | After app updates adding new capabilities, you may need to re-add device.  |

## Security Considerations

- **Token storage**: The Personal Access Token is stored in encrypted device settings.
- **HTTPS only**: All communication with Volt Time Cloud uses HTTPS.
- **No local storage of credentials**: Tokens are only stored in Homey's secure settings store.

## Technical Details

- **Protocol**: Volt Time Cloud REST API (HTTPS)
- **SDK**: Homey SDK v3
- **Language**: TypeScript
- **Polling**: Adaptive — faster during charging, slower when idle
- **Reconnect**: Automatic recovery after temporary API failures
- **Languages**: English (en), Nederlands (nl)

## Credits & Acknowledgements

This app is a co-creation between **Robert Coemans** and **Claude** (Anthropic), built using **[Windsurf](https://windsurf.com)** — an AI-powered IDE for collaborative software development.

If you like this, consider [buying me a coffee](https://buymeacoffee.com/kabxpqqg7z).

Pull requests and issue reports are welcome on [GitHub](https://github.com/rcoemans/com.volttime.chargers/issues).
