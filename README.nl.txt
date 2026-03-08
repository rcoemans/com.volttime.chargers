Bedien en monitor Volt Time EV-laders met Volt Time Cloud of OCPP.

Functies:
- Real-time laadgegevens: vermogen (W), stroom (A), spanning (V), energie (kWh)
- Monitoring van laadstatus: beschikbaar, voorbereiden, laden, onderbroken, afronden, storing
- Connector-/kabelstatus: verbonden, niet verbonden, vergrendeld, ontgrendeld
- Start en stop laadsessies vanuit Homey
- Dynamische laadstroomlimietregeling (6–32 A)
- Sessie-energiemeting (kWh per sessie)
- Totale geïmporteerde energie voor Homey Energy-integratie
- Storingsdetectie en meldingen
- Adaptieve polling: sneller tijdens laden, langzamer wanneer inactief
- 10 apparaat-capabilities
- 8 custom flow-triggerkaarten: laden gestart/gestopt, status gewijzigd, vermogen gewijzigd, storing gedetecteerd, voertuig verbonden/losgekoppeld, laadlimiet gewijzigd
- 5 custom flow-conditiekaarten met inversie-ondersteuning (is/is niet): laadt, verbonden, heeft storing, status is, vermogen is (met operatorvergelijking)
- 4 flow-actiekaarten: laden starten, laden stoppen, stroomlimiet instellen, ladergegevens verversen
- Volledig gelokaliseerd in Engels en Nederlands

Ondersteunde apparaten:
- ALP Volt Time Source 2S (FP-CH-SRC2S-BCB) via Volt Time Cloud API
- Toekomstige Volt Time-ladermodellen (architectuur gereed)

Installatie:
1. Installeer de app op uw Homey
2. Voeg een nieuw apparaat toe: Volt Time Chargers > Source 2S
3. Haal uw Plugchoice API-token op (zie onderstaande stappen)
4. Selecteer uw lader uit de gevonden lijst
5. Het apparaat maakt automatisch verbinding en begint gegevens te lezen
6. Verbindingsinstellingen kunnen later worden aangepast in apparaatinstellingen

Hoe verkrijgt u uw Plugchoice API-token:
Stap 1 — Inloggen bij Plugchoice
- Open het Plugchoice-webportaal: https://app.plugchoice.com
- Log in met uw Volt Time / Plugchoice-account

Stap 2 — Open uw accountinstellingen
- Klik op uw naam linksonder
- Open uw account-/profielinstellingen

Stap 3 — Maak een API-token aan
- Ga naar de sectie API Tokens in uw profielinstellingen
- Maak een nieuw API-token / Personal Access Token aan

Stap 4 — Kopieer het token
- Kopieer de gegenereerde tokenwaarde
- BELANGRIJK: Kopieer dit token direct als het slechts één keer wordt getoond

Stap 5 — Voer het token in Homey in
- Open de instellingen van de Volt Time Chargers-app in Homey
- Plak het token in het veld API Token
- Sla de instellingen op

De app gebruikt deze waarde als Bearer-token en ontdekt daarna automatisch uw laders.

Korte UI-helptekst:
Maak uw token aan in Plugchoice Web Portal -> klik linksonder op uw naam -> Account Settings -> API Tokens.

Bekende beperkingen:
- Vereist internetverbinding (Volt Time Cloud API)
- OAuth-aanmelding gepland voor een toekomstige release
- OCPP lokale communicatie gepland voor een toekomstige release
- Na app-updates met nieuwe capabilities moet u mogelijk het apparaat verwijderen en opnieuw toevoegen
