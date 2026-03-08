Bedien en monitor Volt Time EV-laders met Volt Time Cloud of OCPP.

Functies:
- Real-time laadgegevens: vermogen (W), stroom (A), spanning (V), energie (kWh)
- Monitoring van laadstatus: beschikbaar, voorbereiden, laden, onderbroken, afronden, storing
- Connector-/kabelstatus: verbonden, niet verbonden, vergrendeld, ontgrendeld
- Aan/Uit-schakelaar: start of stopt een actieve laadsessie via Remote Start/Stop opdracht
- Laadstroomlimietschuif (6-32 A): regelt de maximale laadsnelheid naar de lader
- Sessie-energiemeting (kWh per sessie)
- Totale geïmporteerde energie voor Homey Energy-integratie
- Storingsdetectie, meldingen en storing omschrijving
- Adaptieve polling: sneller tijdens laden, langzamer wanneer inactief
- OCPP 1.6J en OCPP 2.0.1 protocolondersteuning (selecteerbaar in apparaatinstellingen)
- OCPP 2.0.1 extra’s: ladertemperatuur, slimme laadprofielen, Plug & Charge (ISO 15118)
- 12 basiscapabilities (incl. lader in orde-indicator en storing omschrijving) + 4 OCPP 2.0.1-capabilities (dynamisch toegevoegd/verwijderd)
- 11 flow-triggerkaarten: laden gestart/gestopt/gepauzeerd/hervat, status gewijzigd, vermogen gewijzigd, storing gedetecteerd/opgelost, voertuig verbonden/losgekoppeld, laadlimiet gewijzigd
- 13 flow-conditiekaarten met inversie-ondersteuning (is/is niet)
- 9 flow-actiekaarten: laden starten/stoppen/wisselen, stroomlimiet instellen/verhogen/verlagen, doelenergie instellen, laadprofiel instellen, verversen
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

Apparaatbediening:
- Aan/Uit-knop ("Laden"): zet laden AAN om een Remote Start-opdracht naar de lader te sturen, of UIT om een Remote Stop-opdracht te sturen. Dit regelt de laadsessie, niet de hardware.
- Laadstroomlimietschuif (6-32 A): stelt de maximale stroom in die de lader levert. Een lagere limiet vermindert laadsnelheid en vermogensonttrekking. Handig voor zonne-energie of netontlasting.

OCPP-protocolversie:
- Standaard: OCPP 1.6J (gebruikt bij eerste installatie van het apparaat)
- OCPP 2.0.1 kan worden geselecteerd in apparaatinstellingen voor extra mogelijkheden en flow-kaarten
- OCPP 2.0.1-capabilities (temperatuur, laadprofiel, Plug & Charge, smart laden) worden automatisch aan het dashboard toegevoegd bij wijziging van de instelling
- OCPP 2.0.1-only flow-kaarten tonen een foutmelding als het apparaat is ingesteld op OCPP 1.6J

Dashboard-capabilities (altijd zichtbaar):
- Laden (aan/uit), Vermogen (W), Stroom (A), Spanning (V), Totale energie (kWh), Sessie-energie (kWh)
- Laadstatus, Connectorstatus, Storingsalarm, Storing omschrijving, Laadstroomlimiet (schuif), Lader in orde

Dashboard-capabilities (alleen OCPP 2.0.1, toegevoegd bij selectie):
- Ladertemperatuur (°C), Laadprofielmodus, Plug & Charge, Smart laden actief

Flow-kaarten - Voorwaarden:
- Lader laadt/laadt niet
- Voertuig is/is niet verbonden
- Lader heeft/heeft geen storing
- Lader is/is niet beschikbaar (inactief en gereed)
- Laadstatus is/is niet [status]
- Vermogen is/is niet [operator] [waarde] W
- Laadstroom is/is niet [operator] [waarde] A
- Laadlimiet is/is niet [operator] [waarde] A
- Spanning is/is niet [operator] [waarde] V
- Sessie-energie is/is niet [operator] [waarde] kWh
- Ladertemperatuur is/is niet [operator] [waarde] °C (OCPP 2.0.1)
- Smart laden is/is niet actief (OCPP 2.0.1)
- Ladergezondheid is/is niet OK

Flow-kaarten - Acties:
- Laden starten
- Laden stoppen
- Laden aan/uit schakelen
- Stroomlimiet instellen op [waarde] A
- Stroomlimiet verhogen met [waarde] A
- Stroomlimiet verlagen met [waarde] A
- Laden stoppen na [waarde] kWh (doelenergie)
- Laadprofielmodus instellen (OCPP 2.0.1): standaard / smart / gepland
- Ladergegevens nu verversen

Bekende beperkingen:
- Vereist internetverbinding (Volt Time Cloud API)
- OAuth-aanmelding gepland voor een toekomstige release
- OCPP lokale communicatie gepland voor een toekomstige release
- Na app-updates met nieuwe capabilities moet u mogelijk het apparaat verwijderen en opnieuw toevoegen
