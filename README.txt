Control and monitor Volt Time EV chargers using Volt Time Cloud or OCPP.

Features:
- Real-time charging data: power (W), current (A), voltage (V), energy (kWh)
- Charger status monitoring: available, preparing, charging, suspended, finishing, faulted
- Connector / cable status: connected, disconnected, locked, unlocked
- Start and stop charging sessions from Homey
- Dynamic charging current limit control (6–32 A)
- Session energy tracking (kWh per session)
- Total imported energy for Homey Energy integration
- Fault detection and alerting
- Adaptive polling: faster during charging, slower when idle
- 10 device capabilities
- 8 custom flow trigger cards: charging started/stopped, status changed, power changed, fault detected, vehicle connected/disconnected, charge limit changed
- 5 custom flow condition cards with inversion support (is/is not): is charging, is connected, has fault, status is, power is (with operator comparison)
- 4 flow action cards: start charging, stop charging, set current limit, refresh charger data
- Fully localized in English and Dutch (Nederlands)

Supported devices:
- ALP Volt Time Source 2S (FP-CH-SRC2S-BCB) via Volt Time Cloud API
- Future Volt Time charger models (architecture ready)

Setup:
1. Install the app on your Homey
2. Add a new device: Volt Time Chargers > Source 2S
3. Obtain your Volt Time API token (see steps below)
4. Select your charger from the discovered list
5. The device will connect automatically and start reading data
6. Connection settings can be changed later in device Settings

How to obtain a Volt Time API Token:
Step 1 — Log in to Volt Time
- Open the Volt Time web portal: https://app.volttime.com
- Log in with your Volt Time account

Step 2 — Open your account settings
- Click your profile icon in the top-right corner
- Select Account Settings

Step 3 — Create an API token
- Navigate to the API Tokens section
- Click Create Token
- Give the token a name, for example: Homey Integration
- Confirm the creation of the token

Step 4 — Copy the token
- Volt Time will show a long string, for example: vt_3f7a2b8e9c1d4e6f...
- IMPORTANT: Copy this token immediately. It may only be shown once

Step 5 — Enter the token in Homey
- Open the Volt Time Chargers app settings in Homey
- Paste the token into the API Token field
- Save the settings

The app will now connect to your Volt Time account and automatically discover your chargers.

Known limitations:
- Requires internet connection (Volt Time Cloud API)
- OAuth sign-in planned for a future release
- OCPP local communication planned for a future release
- After app updates adding new capabilities, you may need to remove and re-add the device
