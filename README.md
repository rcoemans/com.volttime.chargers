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
3. Obtain your Volt Time API token (see **How to obtain a Volt Time API token** below).
4. Select your charger from the discovered list.
5. The device will connect automatically and start reading data.
6. You can change connection settings later in the device **Settings** page.

## How to obtain a Volt Time API token

To connect your Volt Time charger to this Homey app, you need to create an API token in your Volt Time account.

### Step 1 — Log in to Volt Time

- Open the Volt Time web portal: [https://app.volttime.com](https://app.volttime.com)
- Log in with your Volt Time account.

### Step 2 — Open your account settings

- Click your profile icon in the top-right corner.
- Select **Account Settings**.

### Step 3 — Create an API token

- Navigate to the **API Tokens** section.
- Click **Create Token**.
- Give the token a name, for example: `Homey Integration`.
- Confirm the creation of the token.

### Step 4 — Copy the token

- After creating the token, Volt Time will show a long string (for example: `vt_3f7a2b8e9c1d4e6f...`).
- ⚠️ Copy this token immediately. It may only be shown once.

### Step 5 — Enter the token in Homey

- Open the Volt Time Chargers app settings in Homey.
- Paste the token into the API Token field.
- Save the settings.

The app will now connect to your Volt Time account and automatically discover your chargers.

## Device Variables

All capabilities exposed by the charger device, with their variable name (as used in flows/tags) and data type.

| Variable                   | Type    | Description                          | Indicator |
|----------------------------|---------|--------------------------------------|:---------:|
| `onoff`                    | boolean | Charging active (on/off)             | ✓         |
| `measure_power`            | number  | Live charging power (W)              | ✓         |
| `meter_power`              | number  | Total imported energy (kWh)          |           |
| `measure_current`          | number  | Live charging current (A)            | ✓         |
| `measure_voltage`          | number  | Live charging voltage (V)            | ✓         |
| `charger_status`           | enum    | Charger status                       |           |
| `connector_status`         | enum    | Connector / cable status             |           |
| `alarm_fault`              | boolean | Charger fault active                 | ✓         |
| `target_charging_current`  | number  | Charging current limit (A)           |           |
| `meter_session_energy`     | number  | Current session energy (kWh)         |           |

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

| Trigger                    | Description                                                              |
|----------------------------|--------------------------------------------------------------------------|
| Charging started           | Fires when a charging session starts. Provides charger name as token.    |
| Charging stopped           | Fires when a charging session stops. Provides charger name and session energy. |
| Charger status changed     | Fires when the charger status changes. Provides old and new status.      |
| Power has changed          | Fires when charging power changes significantly (100 W deadband).        |
| Fault detected             | Fires when the charger reports a fault.                                  |
| Vehicle connected          | Fires when a vehicle is connected to the charger.                        |
| Vehicle disconnected       | Fires when a vehicle is disconnected from the charger.                   |
| Charge limit has changed   | Fires when the charging current limit changes.                           |

### Conditions (AND…)

| Condition                                    | Description                                              |
|----------------------------------------------|----------------------------------------------------------|
| Charger is / is not charging                 | Checks if the charger is currently charging              |
| Vehicle is / is not connected                | Checks if a vehicle is connected                         |
| Charger has / has no fault                   | Checks if the charger has an active fault                |
| Charger status is / is not [status]          | Checks if the status matches a selected value            |
| Power is / is not [operator] [value] W       | Checks if the power matches the condition                |

### Actions (THEN…)

| Action                              | Description                                              |
|-------------------------------------|----------------------------------------------------------|
| Start charging                      | Starts a charging session                                |
| Stop charging                       | Stops the current charging session                       |
| Set current limit to [value] A      | Sets the charging current limit (6–32 A)                 |
| Refresh charger data now            | Immediately refreshes all charger data from the API      |

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
| Charge limit changed   | `new_limit`      | number | New limit (A)              | 16               |
| Charge limit changed   | `previous_limit` | number | Previous limit (A)         | 32               |

## Homey Energy

The charger integrates with Homey Energy by reporting:

- **Live power** via `measure_power` (W)
- **Total imported energy** via `meter_power` (kWh)
- **Charging state** via `onoff`

The device is marked as a cumulative energy device for accurate Energy dashboard reporting.

## Device Settings

| Setting                         | Default | Description                                        |
|---------------------------------|---------|----------------------------------------------------|
| Personal Access Token           | —       | Volt Time Cloud personal access token (required)   |
| Connector ID                    | 1       | Connector number on the charger                    |
| Polling interval (idle)         | 60 s    | How often to poll when not charging                |
| Polling interval (charging)     | 10 s    | How often to poll during active charging           |

## Use Case Examples

### Charge notification

- **WHEN** Charging stopped → **THEN** Send notification: "Charging complete — {{session_energy}} kWh added"

### Fault alerting

- **WHEN** Fault detected → **THEN** Send notification: "Charger fault: {{fault_text}}"

### Solar surplus charging

- **WHEN** Solar export > 1500 W **AND** Vehicle is connected → **THEN** Start charging
- **WHEN** Solar export < 500 W → **THEN** Stop charging

### Dynamic current control

- **WHEN** Electricity price is low → **THEN** Set current limit to 32 A
- **WHEN** Electricity price is high → **THEN** Set current limit to 6 A

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
- OCPP 1.6J / 2.0.1 protocol support
- Additional Volt Time charger models
- Smart charging algorithms (solar surplus, tariff optimization)

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
