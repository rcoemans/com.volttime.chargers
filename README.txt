Control and monitor Volt Time EV chargers using Volt Time Cloud or OCPP.

Features:
- Real-time charging data: power (W), current (A), voltage (V), energy (kWh)
- Charger status monitoring: available, preparing, charging, suspended, finishing, faulted
- Connector / cable status: connected, disconnected, locked, unlocked
- On/Off toggle: starts or stops an active charging session via Remote Start/Stop command
- Charging current limit slider (6-32 A): controls maximum charging speed sent to the charger
- Session energy tracking (kWh per session)
- Total imported energy for Homey Energy integration
- Fault detection and alerting
- Adaptive polling: faster during charging, slower when idle
- OCPP 1.6J and OCPP 2.0.1 protocol support (selectable in device settings)
- OCPP 2.0.1 extras: charger temperature, smart charging profiles, Plug & Charge (ISO 15118)
- 10 base capabilities + 4 OCPP 2.0.1 capabilities (dynamically added/removed)
- 11 flow trigger cards: charging started/stopped/paused/resumed, status changed, power changed, fault detected/cleared, vehicle connected/disconnected, charge limit changed
- 13 flow condition cards with inversion support (is/is not)
- 9 flow action cards: start/stop/toggle charging, set/increase/decrease current limit, set target energy, set charging profile, refresh
- Fully localized in English and Dutch (Nederlands)

Supported devices:
- ALP Volt Time Source 2S (FP-CH-SRC2S-BCB) via Volt Time Cloud API
- Future Volt Time charger models (architecture ready)

Setup:
1. Install the app on your Homey
2. Add a new device: Volt Time Chargers > Source 2S
3. Obtain your Plugchoice API token (see steps below)
4. Select your charger from the discovered list
5. The device will connect automatically and start reading data
6. Connection settings can be changed later in device Settings

How to get your Plugchoice API token:
Step 1 — Log in to Plugchoice
- Open the Plugchoice web portal: https://app.plugchoice.com
- Sign in with your Volt Time / Plugchoice account

Step 2 — Open your account settings
- Click your name in the bottom-left corner
- Open your account/profile settings

Step 3 — Create an API token
- Navigate to the API Tokens section in your profile settings
- Create a new API token / Personal Access Token

Step 4 — Copy the token
- Copy the generated token value
- IMPORTANT: Copy this token immediately if it is shown only once

Step 5 — Enter the token in Homey
- Open the Volt Time Chargers app settings in Homey
- Paste the token into the API Token field
- Save the settings

The app uses this value as a Bearer token and will now automatically discover your chargers.

Short UI help text:
Create your token in Plugchoice Web Portal -> click your name bottom-left -> Account Settings -> API Tokens.

Device controls:
- On/Off button ("Charging"): turns charging ON to send a Remote Start command to the charger, or OFF to send a Remote Stop command. This controls the charging session, not the hardware power.
- Charging current limit slider (6-32 A): sets the maximum current the charger delivers. Lowering the limit reduces speed and power draw. Useful for solar surplus charging or avoiding grid overload.

OCPP protocol version:
- Default: OCPP 1.6J (used during initial device installation)
- OCPP 2.0.1 can be selected in device settings to unlock extra capabilities and flow cards
- OCPP 2.0.1 capabilities (temperature, charging profile, Plug & Charge, smart charging) are automatically added/removed when you change the setting
- OCPP 2.0.1-only flow cards will show an error if the device is set to OCPP 1.6J

Flow cards - Conditions:
- Charger is/is not charging
- Vehicle is/is not connected
- Charger has/has no fault
- Charger is/is not available (idle and ready)
- Charger status is/is not [status]
- Power is/is not [operator] [value] W
- Charging current is/is not [operator] [value] A
- Charge limit is/is not [operator] [value] A
- Voltage is/is not [operator] [value] V
- Session energy is/is not [operator] [value] kWh
- Charger temperature is/is not [operator] [value] °C (OCPP 2.0.1)
- Smart charging is/is not active (OCPP 2.0.1)
- Charger health is/is not OK

Flow cards - Actions:
- Start charging
- Stop charging
- Toggle charging on/off
- Set current limit to [value] A
- Increase current limit by [value] A
- Decrease current limit by [value] A
- Stop charging after [value] kWh (target energy)
- Set charging profile mode (OCPP 2.0.1): default / smart / scheduled
- Refresh charger data now

Known limitations:
- Requires internet connection (Volt Time Cloud API)
- OAuth sign-in planned for a future release
- OCPP local communication planned for a future release
- After app updates adding new capabilities, you may need to remove and re-add the device
