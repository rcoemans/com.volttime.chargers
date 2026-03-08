
# Homey Integration Plan
## Volt Time Chargers Homey App

App Name: Volt Time Chargers  
App ID: com.volttime.chargers  
Description: Control and monitor Volt Time EV chargers using Volt Time Cloud or OCPP.  
Date: 2026-03-08

---

# 1. Scope of the App

This Homey app is designed to integrate **Volt Time EV chargers** with Homey.

The app will support:

- Volt Time Cloud API
- OCPP communication (future expansion)
- Multiple Volt Time charger models

The initial focus device is:

**ALP Volt Time Source 2S (FP‑CH‑SRC2S‑BCB)**

However, the architecture is intentionally designed to support **all Volt Time chargers** in the future.

---

# 2. Final Recommended App Architecture

The recommended architecture is a **vendor‑specific app with protocol abstraction**.

This allows the same app to support:

- Volt Time Cloud API
- OCPP communication
- Multiple charger models

Architecture overview:

```
Homey App: Volt Time Chargers
│
├── Integration Layer
│     ├── Volt Time Cloud API
│     └── OCPP Protocol
│
├── Charger Drivers
│     ├── Source 2S
│     ├── Future Volt Time models
│     └── Shared Charger Base Class
│
└── Homey Features
      ├── Device capabilities
      ├── Flow cards
      ├── Energy reporting
      └── Automations
```

Benefits of this architecture:

- Clean separation of **protocol logic** and **device drivers**
- Easy to support **future Volt Time chargers**
- Allows gradual introduction of **OCPP features**
- Keeps the Homey app manageable and maintainable

---

# 3. Homey App ID Justification

Chosen App ID:

```
com.volttime.chargers
```

Reasons:

### 1. Vendor‑specific scope

The app targets **Volt Time chargers**, not generic OCPP chargers.

Using a vendor namespace prevents confusion with other OCPP implementations.

### 2. Future‑proof

The ID supports:

- Source 2S
- future Volt Time chargers
- additional product lines

### 3. Avoids protocol lock‑in

Using an ID like:

```
org.openchargealliance.ocpp
```

would imply a **universal OCPP implementation**, which would require:

- supporting many charger brands
- handling vendor quirks
- maintaining a full OCPP backend

This is outside the intended scope of this app.

### 4. Avoids device lock‑in

Using:

```
com.volttime.source2s
```

would restrict the app to a single device.

This would make it harder to support future Volt Time chargers.

Therefore the best compromise is:

```
com.volttime.chargers
```

---

# 4. Driver Structure for Volt Time Chargers

The Homey driver structure should separate:

- **protocol logic**
- **device drivers**

Recommended structure:

```
com.volttime.chargers/
│
├── app.js
├── app.json
│
├── lib/
│   ├── api/
│   │   └── voltTimeApi.js
│   │
│   ├── ocpp/
│   │   ├── ocpp16.js
│   │   └── ocpp201.js
│   │
│   └── chargerBase.js
│
├── drivers/
│   ├── source2s/
│   │   ├── driver.js
│   │   └── device.js
│   │
│   └── genericVoltTime/
│       ├── driver.js
│       └── device.js
│
└── flow/
    ├── triggers
    ├── conditions
    └── actions
```

## chargerBase class

Shared logic:

- polling
- capability updates
- connection management
- protocol selection

Example responsibilities:

```
ChargerBase
│
├── refreshState()
├── startCharging()
├── stopCharging()
├── setChargeLimit()
└── updateCapabilities()
```

Device drivers then extend the base class.

Example:

```
Source2SDevice extends ChargerBase
```

This ensures:

- minimal code duplication
- consistent behavior across devices

---

# 5. Future Universal OCPP Roadmap

Although this app is vendor‑specific, it may eventually support broader OCPP functionality.

Future roadmap:

## Phase 1 — Cloud Integration

- Volt Time Cloud API
- charger discovery
- meter values
- start / stop charging
- charge limit control

## Phase 2 — OCPP Support

Add protocol support for:

- OCPP 1.6J
- OCPP 2.0.1

Device setting:

```
Integration Mode
• Volt Time Cloud
• OCPP 1.6J
• OCPP 2.0.1
```

## Phase 3 — Advanced Smart Charging

Potential features:

- solar surplus charging
- load balancing
- scheduled charging
- tariff‑based charging

## Phase 4 — Optional Universal OCPP Layer

If demand grows, the protocol layer could evolve into a **generic OCPP engine**.

Architecture:

```
Homey OCPP Core
│
├── Volt Time driver
├── other charger drivers
└── protocol abstraction layer
```

However this would likely become **a separate Homey app**, because universal OCPP support requires:

- extensive device compatibility testing
- vendor‑specific workarounds
- more maintenance

Therefore the current app intentionally remains **Volt Time focused**.

---

# 6. OCPP Version Support (Source 2S)

According to the Source 2S product documentation:

Supported protocols:

| Protocol | Status |
|--------|-------|
| OCPP 1.6J | Supported |
| OCPP 2.0.1 | Supported |
| OCPP 2.1 | Not publicly confirmed |
| MQTT via Volt Time Cloud | Supported |
| Matter via Volt Time Cloud | Supported |

Recommended OCPP default:

```
OCPP 2.0.1
```

Reasons:

- newer protocol
- improved security
- richer device management
- better smart‑charging support

Fallback:

```
OCPP 1.6J
```

because it remains widely used and compatible with many back‑office systems.

OCPP 2.1 should not be enabled unless Volt Time confirms firmware support.

---

# 7. References

Volt Time Developer API  
https://developer.volttime.com/

Source 2S Datasheet  
https://alp-ev.com/wp-content/uploads/2025/10/Alp-EV_Datasheet_VoltTime_Source_2S_2025-01_.pdf

Open Charge Alliance (OCPP)  
https://openchargealliance.org/

OCPP 2.1 announcement  
https://openchargealliance.org/ocpp-2-1-is-now-available/



---

# 8. Complete Homey pairing flow design

The pairing flow should support both a fast first release and a cleaner long-term onboarding experience.

## 8.1 Pairing goals

The pairing experience should:

- let a user connect a Volt Time account or token with minimal friction
- discover one or more chargers automatically
- allow selection of a charger and connector
- store enough information to start polling immediately
- keep the door open for future OCPP-based pairing

## 8.2 Recommended pairing modes

### Mode A — Personal Access Token pairing
This is the recommended **v1 pairing mode**.

Why this should come first:

- simplest to implement
- no redirect handling required
- easier to test
- works well for technical users

Suggested flow:

```text
Step 1: Intro screen
Step 2: Explain how to create a Volt Time personal access token
Step 3: User pastes token
Step 4: Validate token by calling /chargers
Step 5: Show discovered chargers
Step 6: User selects charger
Step 7: Optional connector selection / defaults
Step 8: Create device
```

### Mode B — OAuth pairing
This is the recommended **v2 pairing mode**.

Suggested flow:

```text
Step 1: Intro screen
Step 2: "Sign in with Volt Time"
Step 3: Browser opens Volt Time authorization page
Step 4: User grants access
Step 5: Homey receives authorization code
Step 6: App exchanges code for token
Step 7: App calls /chargers
Step 8: User selects charger
Step 9: Create device
```

## 8.3 Suggested pairing screens

### Screen 1 — Welcome
Text example:

```text
Connect your Volt Time account to discover and control your EV chargers.
You can pair using a Personal Access Token now, and OAuth sign-in can be added later.
```

Buttons:
- Continue with Personal Access Token
- Sign in with Volt Time (future)

### Screen 2 — Token instructions
Text example:

```text
Create a Personal Access Token in Volt Time Cloud and paste it below.
The app will use it to read charger status and send charge control commands.
```

Fields:
- Access token

Validation:
- token present
- token format sanity check
- live API validation by calling `/chargers`

### Screen 3 — Charger discovery
Display:
- charger name
- model
- charger UUID
- site name if available

User selects one charger.

### Screen 4 — Charger settings
Fields:
- connector ID, default `1`
- integration mode, default `Volt Time Cloud API`
- polling interval idle
- polling interval charging

### Screen 5 — Finish
Text example:

```text
Your Volt Time charger has been added to Homey.
You can now use it in Flows and Energy.
```

## 8.4 Pairing-time validation checks

During pairing, the app should verify:

- the token is valid
- at least one charger is visible
- the selected charger can be read successfully
- the selected connector exists or the default connector works
- the charger supports the intended protocol/integration mode

## 8.5 Error messages to handle well

The pairing flow should explicitly handle:

- invalid token
- expired token
- no chargers found
- network timeout
- cloud service unavailable
- user selects a charger that later becomes unavailable

Suggested user-facing language:

```text
We could not retrieve chargers from Volt Time Cloud.
Please verify your token and try again.
```

## 8.6 Pairing data to store

Per Homey device, store at minimum:

- charger UUID
- charger name
- connector ID
- protocol / integration mode
- polling intervals
- token reference or account link

If OAuth is used, store account-level auth securely at app level where practical.

---

# 9. Homey Energy integration (kWh reporting best practices)

A charger integration becomes much more useful when the device contributes cleanly to Homey Energy.

## 9.1 Main Energy goals

The charger should report:

- current power consumption
- cumulative imported energy
- stable availability
- correct charging on/off state

## 9.2 Recommended capabilities for Energy-related reporting

Use these capabilities consistently:

- `measure_power` for live charging power in watts
- `meter_power` for cumulative imported energy in kWh
- `onoff` for active charging state

These three are the core of good Homey Energy behavior.

## 9.3 Best practice for `measure_power`

`measure_power` should:

- reflect real live power draw where possible
- be updated frequently while charging
- go back to `0` quickly after charging stops

Recommended behavior:
- update every 10 seconds while charging
- clamp negative or nonsensical values to `0`
- avoid frequent jitter if the API briefly returns null or missing values

## 9.4 Best practice for `meter_power`

`meter_power` should:

- represent **total imported energy**
- be monotonically increasing where possible
- use kWh, not Wh, if mapped to Homey energy expectations
- survive app restarts without being reset accidentally

Important implementation note:
if the API provides a total energy register, prefer that over trying to integrate power over time yourself.

Reason:
- it is more accurate
- it avoids drift
- it handles app downtime better

## 9.5 Session energy vs total energy

It is useful to distinguish:

- **total energy** → `meter_power`
- **session energy** → custom capability such as `meter_session_energy`

Do not overload `meter_power` with session-only values.  
Homey Energy works best when `meter_power` is cumulative lifetime or long-term cumulative imported energy.

## 9.6 Unit normalization

Normalize all energy values carefully:

- if the API returns Wh, convert to kWh
- if the API returns W, keep as W for `measure_power`
- if current is in A and voltage is in V, do not infer power if the API already gives power directly

Suggested conversions:

```text
Wh ÷ 1000 = kWh
kW × 1000 = W
```

## 9.7 Handling stale data

To prevent misleading Energy charts:

- mark the device unavailable if the charger cannot be read for a prolonged period
- do not keep reporting an old non-zero `measure_power` indefinitely
- if telemetry is stale after repeated failures, set `measure_power` to `0` and raise availability warning text

## 9.8 Recommended Energy labeling

Use a device name that clearly identifies the charging point, for example:

```text
Driveway Charger
Garage Charger
```

This improves Energy dashboard readability.

---

# 10. Smart charging design

The smart charging layer should be introduced after the basic cloud integration is stable.

## 10.1 Goals of smart charging

Support automations such as:

- solar surplus charging
- tariff-based charging
- dynamic current control
- scheduled charging
- peak shaving / load avoidance

## 10.2 Solar surplus charging

### Concept
When the house exports power to the grid, the charger increases charging current.  
When export falls, the charger reduces charging current or pauses.

### Example control loop

Inputs:
- household net power
- charger current limit
- configured minimum current
- configured maximum current

Outputs:
- new charger current limit

Recommended logic:

```text
If export > threshold:
    increase current limit gradually
If export falls below threshold:
    decrease current limit gradually
If export becomes strongly negative:
    pause charging or return to minimum current
```

### Practical notes
- avoid changing the current every second
- use a deadband to reduce oscillation
- obey EVSE minimum current rules
- respect charger API / protocol rate limits

Suggested tuning:
- control interval: 15 to 30 seconds
- deadband: for example 300 to 500 W
- step size: 1 A per control cycle

## 10.3 Dynamic current control

This is broader than solar surplus charging.

Possible inputs:
- total home consumption
- contracted grid limit
- battery charging/discharging state
- electricity tariff
- user target departure time

Possible outputs:
- current limit
- start/stop charging
- target charging window

### Example use case — avoid main fuse overload

```text
Household capacity limit = 25 A
House load excluding EV = 18 A
Available for EV = 7 A
Set charger limit = 6 A minimum safe current
```

### Example use case — cheap tariff window

```text
If tariff is low:
    start charging
Else:
    stop charging unless user has selected "charge now"
```

## 10.4 Smart charging settings to expose

Suggested advanced settings:

- minimum charging current
- maximum charging current
- solar surplus mode enabled
- export threshold
- control interval
- pause when no surplus
- tariff mode enabled
- charge-now override
- target-ready time

## 10.5 Safety and stability rules

The app should always enforce:

- minimum and maximum charger limits
- rate limiting for control commands
- retry rules with backoff
- fallback to a safe default current when telemetry disappears

## 10.6 Recommended v1 smart charging scope

The best first smart charging feature is:

### **Dynamic current limit action**
Let Homey Flows set the charger current limit.

Why:
- simple
- powerful
- easy to combine with solar/tariff logic from other Homey devices

Then later add:
- built-in surplus algorithm
- built-in tariff optimization
- target-ready scheduling

---

# 11. OCPP message mapping to Homey capabilities

This section is for the future OCPP-based mode of the app.

## 11.1 Why a mapping layer is needed

OCPP messages are protocol events and measurements.  
Homey needs stable device capabilities and Flow triggers.

So the app should translate OCPP events into:

- capability updates
- availability state
- Flow triggers
- warnings / errors

## 11.2 Core OCPP message mapping for OCPP 1.6J

| OCPP message / field | Meaning | Homey mapping |
|---|---|---|
| `StatusNotification.status = Available` | Charger ready | `charger_status = available`, `onoff = false` |
| `StatusNotification.status = Preparing` | Cable connected / preparing | `charger_status = preparing` |
| `StatusNotification.status = Charging` | Active charging | `charger_status = charging`, `onoff = true` |
| `StatusNotification.status = SuspendedEV` | EV paused | `charger_status = suspended_ev` |
| `StatusNotification.status = SuspendedEVSE` | EVSE paused | `charger_status = suspended_evse` |
| `StatusNotification.status = Finishing` | Session ending | `charger_status = finishing` |
| `StatusNotification.status = Faulted` | Fault active | `charger_status = faulted`, availability warning |
| `MeterValues` power measurand | Instant power | `measure_power` |
| `MeterValues` current measurand | Current | `measure_current` |
| `MeterValues` voltage measurand | Voltage | `measure_voltage` |
| `MeterValues` energy register | Imported energy | `meter_power` |
| `StartTransaction` | Session started | trigger `charging_started` |
| `StopTransaction` | Session ended | trigger `charging_stopped` |

## 11.3 OCPP 2.0.1 mapping notes

OCPP 2.0.1 has richer structures than 1.6J, but the same Homey abstraction still works.

Map these broad concepts:

- transaction / charging state → `onoff`, `charger_status`
- component / variable device state → settings, diagnostics, advanced capabilities
- meter values → `measure_power`, `measure_current`, `measure_voltage`, `meter_power`
- notifications / events → Flow triggers and warnings

## 11.4 Connector state mapping

Suggested `connector_status` values:

- disconnected
- connected
- locked
- unlocked
- unknown

Possible derivation:
- `Preparing` often implies connected
- `Available` may imply disconnected or idle connected depending on charger behavior
- protocol-specific cable-lock data can refine this later

## 11.5 Fault mapping

Translate protocol faults into:

- `charger_status = faulted`
- device warning or unavailable state
- Flow trigger such as `charger_faulted`

This is important for user trust and troubleshooting.

## 11.6 Example mapping function shape

```javascript
function mapOcppStatusToHomey(status) {
  switch (status) {
    case 'Available':
      return { charger_status: 'available', onoff: false };
    case 'Preparing':
      return { charger_status: 'preparing' };
    case 'Charging':
      return { charger_status: 'charging', onoff: true };
    case 'SuspendedEV':
      return { charger_status: 'suspended_ev' };
    case 'SuspendedEVSE':
      return { charger_status: 'suspended_evse' };
    case 'Finishing':
      return { charger_status: 'finishing', onoff: false };
    case 'Faulted':
      return { charger_status: 'faulted', onoff: false };
    default:
      return { charger_status: 'unknown' };
  }
}
```

---

# 12. Testing strategy for the app

A good testing strategy is essential before publishing in the Homey App Store.

## 12.1 Testing goals

The app should be tested for:

- correct pairing
- reliable telemetry
- correct control behavior
- robust error handling
- stable Energy reporting
- predictable Flow behavior

## 12.2 Test layers

### Layer 1 — Unit tests
Test the smallest logic pieces independently.

Focus on:
- API response parsing
- unit conversions
- status mapping
- charge limit validation
- smart charging calculations

Examples:
- convert Wh to kWh correctly
- map API/OCPP status to Homey status
- reject current limit outside allowed range

### Layer 2 — Integration tests against mocked API
Mock Volt Time Cloud responses.

Test:
- login/token validation
- charger discovery
- meter polling
- start/stop charging calls
- set charge limit
- error responses such as 401, 404, 429, 500

This is the most important automated test layer for the v1 app.

### Layer 3 — End-to-end testing on real hardware
Use a real Volt Time Source 2S charger.

Test:
- pairing from scratch
- charger visible in Homey
- live charging starts and stops correctly
- power/energy values update
- current limit changes take effect
- app recovers after Homey restart
- app recovers after temporary internet loss

### Layer 4 — Flow and Energy validation
Test Homey user experience directly.

Test:
- trigger cards fire when expected
- condition cards reflect real charging state
- action cards perform the correct command
- Energy dashboard displays sensible values
- no duplicate or missing energy jumps

## 12.3 Suggested test matrix

Test at minimum these states:

| Scenario | Expected result |
|---|---|
| Valid token + one charger | Device pairs successfully |
| Valid token + multiple chargers | User can select desired charger |
| Invalid token | Clear pairing error |
| Charger idle | `measure_power = 0`, charger available |
| Charger charging | live power > 0, `onoff = true` |
| Stop command | charging ends, state updates |
| Set 6 A limit | limit accepted and reflected |
| API timeout | retry, then warning/unavailable state |
| App restart | device resumes polling without data corruption |

## 12.4 Edge cases worth testing

Include:

- charger disappears from account
- connector ID is wrong
- API returns null telemetry
- energy register resets unexpectedly
- token expires during operation
- temporary 429 rate limiting
- charger transitions quickly through statuses
- user toggles charging rapidly from Flow and UI

## 12.5 Performance and stability tests

Check:

- polling does not overlap when responses are slow
- repeated timers are cleaned up on device delete
- multiple paired chargers do not create excessive API load
- app remains stable over long runs

## 12.6 Manual verification checklist before publishing

Before release, verify manually:

- pairing instructions are understandable
- error messages are human-friendly
- device capabilities update consistently
- Flow cards are translated and named clearly
- app works with at least one real Source 2S setup
- app handles offline periods gracefully

## 12.7 Future OCPP testing strategy

When OCPP mode is added, add protocol-specific testing:

- OCPP 1.6J message sequencing
- OCPP 2.0.1 event handling
- meter value mapping
- reconnect behavior
- unsupported message handling
- protocol-version selection behavior from device settings

---

# 13. Recommended next implementation order

Based on the design above, the best next build order is:

1. pairing via Personal Access Token
2. charger discovery and device creation
3. polling + capability updates
4. start / stop charging
5. set current limit Flow action
6. Homey Energy validation
7. richer Flow cards
8. OAuth pairing
9. built-in smart charging helpers
10. future OCPP mode
