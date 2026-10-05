// Innstillinger for Minnested-prototypen. Alle mål er i meter.
export const CONFIG = {
  // Bredden på skiltbildet slik det er skrevet ut (ikke hele arket).
  // Må stemme med utskriften, ellers blir bygget feil størrelse.
  skiltBredde: 0.18,

  // "bakke": skiltet ligger flatt, toppkanten peker mot bygget.
  // "vegg":  skiltet står loddrett og vender mot deg, bygget står bak det.
  montering: "vegg",

  // Bare for "vegg": høyde fra bakken til midten av skiltbildet.
  skiltHoyde: 1.0,

  // Byggets plassering i forhold til midten av skiltet.
  bygg: {
    frem: 8,           // meter fremover (bort fra deg)
    side: 0,           // meter til høyre (+) eller venstre (-)
    rotasjon: 0,       // grader rundt loddrett akse
    hoydeJustering: 0  // meter opp (+) eller ned (-)
  },

  // Egen modell: legg en .glb i mappen modell/ og skriv navnet her,
  // f.eks. "modell/bygg.glb". Modellen må være i meter med Y opp,
  // og origo i byggets referansepunkt. null betyr testhuset.
  modellFil: "modell/Moisund Elvebredd 15.glb",

  // Skala for bordmodell-visningen (1:50).
  bordmodellSkala: 1 / 50,

  // Utjevning av skjelving. Lavere filterBeta gir roligere, men tregere bilde.
  utjevning: { filterMinCF: 0.001, filterBeta: 1000 }
};
