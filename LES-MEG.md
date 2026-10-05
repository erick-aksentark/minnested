# Minnested, prøveversjon

En AR-prototype som viser et bygg på stedet når telefonen ser et skilt.
Alt kjører i nettleseren. Ingen app, ingen konto for de som besøker.

## Innhold

- `index.html`: AR-visningen som QR-koden åpner
- `skilt.html`: utskrift av skiltet med QR-kode
- `config.js`: alle innstillinger (skiltbredde, avstand, modell)
- `app.js`: logikken
- `targets/`: skiltbildet (`skilt.png`) og den trente filen (`skilt.mind`)
- `modell/`: her legger du egne `.glb`-modeller
- `vendor/`: three.js 0.160, MindAR 1.2.5 og QR-generator, lagret lokalt

## 1. Legg det ut på nett (GitHub Pages, gratis)

Kameraet virker bare på adresser som starter med `https`, derfor må siden ligge på nett.

1. Lag en gratis konto på github.com.
2. Trykk **New repository**. Kall det `minnested`, velg **Public** og trykk **Create repository**.
3. Trykk **uploading an existing file** og dra inn *innholdet* i mappen (ikke selve mappen). Trykk **Commit changes**.
4. Gå til **Settings → Pages**. Under *Branch* velger du `main` og `/ (root)`, og trykker **Save**.
5. Etter ett til to minutter ligger siden på `https://BRUKERNAVN.github.io/minnested/`.

## 2. Skriv ut skiltet

1. Åpne `https://BRUKERNAVN.github.io/minnested/skilt.html` på datamaskinen.
2. Adressen til QR-koden fylles inn automatisk. Sjekk at den stemmer.
3. Trykk **Skriv ut skiltet** og velg **100 %** eller **faktisk størrelse**. Ikke «tilpass til side».
4. Mål kontrollinjen. Den skal være 100 mm. Hvis ikke, juster utskriften.

Skann QR-koden med telefonen før du går ut, for å sjekke at den åpner riktig side.

## 3. Test

**Bordmodell** (innendørs): legg arket på bordet, trykk *Start kamera*, velg **Bord**. Huset står i 1:50 oppå skiltet.

**Fullskala** (utendørs): legg arket flatt på bakken med toppkanten mot der huset skal stå. Still deg ved nederste kant. Huset står 8 meter frem. Hold skiltet i bildet, da forsvinner ikke huset.

Matt papir fungerer best. Blankt papir gir refleks i sola. Et ark i plastlomme eller laminert holder seg i vind og fukt.

## 4. Juster

Alt justeres i `config.js` (rediger direkte på GitHub med blyant-ikonet):

- `skiltBredde`: må stemme med utskriften (0.18 = 180 mm)
- `montering`: `"bakke"` eller `"vegg"`
- `bygg.frem`, `bygg.side`, `bygg.rotasjon`: plassering av bygget
- `utjevning.filterBeta`: lavere tall gir roligere, men tregere bilde

## 5. Bytt til egen modell

1. Eksporter bygget som `.glb` i meter, med origo i et punkt du kan måle fra skiltet.
2. Hold modellen lett: under ca. 20 MB, komprimerte teksturer.
3. Last opp filen til `modell/` og sett `modellFil: "modell/bygg.glb"` i `config.js`.

## 6. Bytt skiltbilde

1. Lag et nytt bilde med mange skarpe hjørner og kontraster, uten gjentatte mønstre.
2. Tren det i MindARs gratis verktøy: https://hiukim.github.io/mind-ar-js-doc/tools/compile
3. Erstatt `targets/skilt.png` og `targets/skilt.mind`.

## Kjente begrensninger

- Skiltet må være i bildet hele tiden. Går du bort fra det, forsvinner bygget.
- Jo lenger unna bygget står, jo mer synes små skjelvinger. Et større skilt hjelper.
- Lyset i modellen tilpasser seg ikke vær og tid på døgnet.
