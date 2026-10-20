// Henter alle opskrifter, læser filtre og søgning fra URL'en og viser de opskrifter, der passer.
// Giver en søgning ingen resultater, vises et link til request-siden.

// limit=0 henter alle opskrifter
const opskriftURL = "https://dummyjson.com/recipes?limit=0";

// Her kommer opskrift-kortene ind
const opskriftContainer = document.querySelector("#recipeContainer");
// Overskriften over opskrifterne
const overskrift = document.querySelector("#listTitle");
// Her kommer køkken-knapperne ind
const koekkenKnapper = document.querySelector("#cuisineButtons");
// "See more" under køkkenerne
const koekkenMereKnap = document.querySelector("#cuisineMore");
// "← Back"-knappen
const tilbageKnap = document.querySelector("#backButton");
// "See more" under opskrifterne
const flereKnap = document.querySelector(".more-btn");
// Boksen med "No recipes for ..." og "Request it →"
const ingenFundet = document.querySelector("#emptyState");
// Søgefeltet i headeren
const soegefelt = document.querySelector(".search input");
// Teksten "OUR NEWEST RECIPES:"
const introTekst = document.querySelector(".intro-section a");

// Alle opskrifter fra API'et
let alleOpskrifter = [];
// De opskrifter, der passer til filtrene
let fundneOpskrifter = [];

// Hvor mange opskrifter der vises ad gangen
const antalPrSide = 12;
// Hvor mange der vises lige nu
let antalVist = antalPrSide;

// Hvor mange køkken-knapper der vises før "See more"
const antalKoekkenerVist = 6;

// Det, der er valgt i hvert filter. "All" betyder, at intet er valgt
const filtre = {
  mealType: "All",
  cuisine: "All",
  time: "All",
  search: "All",
};

laesFiltreFraURL();

// Læser filtrene fra adressen
function laesFiltreFraURL() {
  // Delen efter ? i adressen, fx ?mealType=Breakfast&search=lasagne
  const urlDele = new URLSearchParams(window.location.search);

  filtre.mealType = hentFilter(urlDele, "mealType");
  filtre.cuisine = hentFilter(urlDele, "cuisine");
  filtre.time = hentFilter(urlDele, "time");
  filtre.search = hentFilter(urlDele, "search");

  // Vis søgeordet i søgefeltet, eller tøm feltet
  if (filtre.search === "All") {
    soegefelt.value = "";
  } else {
    soegefelt.value = filtre.search;
  }
}

// Henter ét filter fra adressen. Mangler det, bliver det "All"
function hentFilter(urlDele, navn) {
  const vaerdi = urlDele.get(navn);

  if (vaerdi === null || vaerdi === "") {
    return "All";
  }
  return vaerdi;
}

// Går til listview med de valgte filtre i adressen, fx listview.html?mealType=Breakfast
function gaaTilFiltre() {
  const urlDele = new URLSearchParams();

  // Kun filtre, der er valgt, kommer med i adressen
  if (filtre.mealType !== "All") {
    urlDele.set("mealType", filtre.mealType);
  }
  if (filtre.cuisine !== "All") {
    urlDele.set("cuisine", filtre.cuisine);
  }
  if (filtre.time !== "All") {
    urlDele.set("time", filtre.time);
  }
  if (filtre.search !== "All") {
    urlDele.set("search", filtre.search);
  }

  window.location.href = "listview.html?" + urlDele;
}

// Henter opskrifterne fra API'et
function hentData(url) {
  fetch(url)
    .then((svar) => svar.json())
    .then((data) => {
      console.log(data);
      alleOpskrifter = data.recipes;
      visKoekkenKnapper();
      tilfoejKlikPaaFilterKnapper();
      findOpskrifter();
    });
}

// Køkkener, som "ASIA"-knappen dækker
const asiatiskeKoekkener = ["Asian", "Japanese", "Thai", "Korean", "Vietnamese", "Indian", "Pakistani"];

// Laver én knap pr. køkken
function visKoekkenKnapper() {
  // Liste med hvert køkken én gang
  const koekkener = [];

  alleOpskrifter.forEach((opskrift) => {
    // Tilføj køkkenet, hvis det ikke allerede er på listen
    if (koekkener.includes(opskrift.cuisine) === false) {
      koekkener.push(opskrift.cuisine);
    }
  });

  // Sorter alfabetisk
  koekkener.sort();

  // nummer = placering på listen (0, 1, 2 ...)
  koekkener.forEach((koekken, nummer) => {
    // Knaptekst med store bogstaver, fx "ITALIAN"
    let knapTekst = koekken.toUpperCase();
    if (koekken === "Asian") {
      knapTekst = "ASIA";
    }

    // Knap 7 og frem får klassen "extra" og er skjult indtil "See more"
    let ekstraKlasse = "";
    if (nummer >= antalKoekkenerVist) {
      ekstraKlasse = "extra";
    }

    koekkenKnapper.innerHTML += `<button class="btn-tag ${ekstraKlasse}" data-filter="cuisine" data-value="${koekken}">${knapTekst}</button>`;
  });

  // Er det valgte køkken en af de skjulte knapper, vises alle køkkener
  const valgtKnap = koekkenKnapper.querySelector(`[data-value="${filtre.cuisine}"]`);
  if (valgtKnap !== null && valgtKnap.classList.contains("extra")) {
    skiftKoekkener();
  }
}

// Viser eller skjuler de ekstra køkkener
function skiftKoekkener() {
  if (koekkenKnapper.classList.contains("show-all")) {
    koekkenKnapper.classList.remove("show-all");
    koekkenMereKnap.textContent = "See more";
  } else {
    koekkenKnapper.classList.add("show-all");
    koekkenMereKnap.textContent = "See less";
  }
}

koekkenMereKnap.addEventListener("click", skiftKoekkener);

// Giver hver filterknap en klik-funktion
// Kaldes efter køkken-knapperne er lavet, så de også kommer med
function tilfoejKlikPaaFilterKnapper() {
  const knapper = document.querySelectorAll(".filter-buttons button");

  knapper.forEach((knap) => {
    knap.addEventListener("click", () => {
      // Fx "mealType" og "Breakfast"
      const filterNavn = knap.getAttribute("data-filter");
      const filterVaerdi = knap.getAttribute("data-value");

      // Knappen er allerede valgt
      if (filtre[filterNavn] === filterVaerdi) {
        return;
      }

      // Gem valget, fx filtre.mealType = "Breakfast"
      filtre[filterNavn] = filterVaerdi;
      gaaTilFiltre();
    });
  });
}

// "← Back" går til siden uden filtre (ALL RECIPES)
tilbageKnap.addEventListener("click", () => {
  window.location.href = "listview.html";
});

// Finder de opskrifter, der passer til filtrene, og viser dem
function findOpskrifter() {
  const passer = [];

  alleOpskrifter.forEach((opskrift) => {
    // Måltid, køkken, tid og søgning skal alle passe (&& = og)
    if (maaltidPasser(opskrift) && koekkenPasser(opskrift) && tidPasser(opskrift) && soegningPasser(opskrift)) {
      passer.push(opskrift);
    }
  });

  fundneOpskrifter = passer;

  markerValgteKnapper();
  visOverskrift();
  visOpskrifter();

  // Intet filter valgt: man er på ALL RECIPES, så "← Back" skjules
  if (filtre.mealType === "All" && filtre.cuisine === "All" && filtre.time === "All" && filtre.search === "All") {
    tilbageKnap.hidden = true;
  } else {
    tilbageKnap.hidden = false;
  }
}

// Passer måltidet? (true/false)
function maaltidPasser(opskrift) {
  if (filtre.mealType === "All") {
    return true;
  }

  let passer = false;
  // En opskrift kan have flere måltider, fx ["Lunch", "Dinner"]
  opskrift.mealType.forEach((maaltid) => {
    // includes, fordi API'et bruger både "Snack" og "Snacks"
    if (maaltid.includes(filtre.mealType)) {
      passer = true;
    }
  });
  return passer;
}

// Passer køkkenet? (true/false)
function koekkenPasser(opskrift) {
  if (filtre.cuisine === "All") {
    return true;
  }

  // "ASIA" passer til alle asiatiske køkkener
  if (filtre.cuisine === "Asian") {
    return asiatiskeKoekkener.includes(opskrift.cuisine);
  }

  return opskrift.cuisine === filtre.cuisine;
}

// Passer tiden? (true/false)
function tidPasser(opskrift) {
  // Samlet tid = forberedelse + tilberedning
  const samletTid = opskrift.prepTimeMinutes + opskrift.cookTimeMinutes;

  if (filtre.time === "Under") {
    return samletTid < 30;
  }
  if (filtre.time === "Over") {
    return samletTid >= 30;
  }
  return true;
}

// Passer søgningen? (true/false)
function soegningPasser(opskrift) {
  if (filtre.search === "All") {
    return true;
  }

  // Søgeordet med små bogstaver
  const soegeord = filtre.search.toLowerCase();

  // Starter som false. Bliver true, hvis søgeordet findes
  let passer = false;

  // Står søgeordet i navnet?
  if (opskrift.name.toLowerCase().includes(soegeord)) {
    passer = true;
  }

  // Står søgeordet i et af tags?
  opskrift.tags.forEach((tag) => {
    if (tag.toLowerCase().includes(soegeord)) {
      passer = true;
    }
  });

  // Står søgeordet i en af ingredienserne?
  opskrift.ingredients.forEach((ingrediens) => {
    if (ingrediens.toLowerCase().includes(soegeord)) {
      passer = true;
    }
  });

  return passer;
}

// Giver den valgte knap i hvert filter klassen "active"
function markerValgteKnapper() {
  const knapper = document.querySelectorAll(".filter-buttons button");

  knapper.forEach((knap) => {
    const filterNavn = knap.getAttribute("data-filter");
    const filterVaerdi = knap.getAttribute("data-value");

    if (filtre[filterNavn] === filterVaerdi) {
      knap.classList.add("active");
    } else {
      knap.classList.remove("active");
    }
  });
}

// Skriver overskriften over opskrifterne
function visOverskrift() {
  // Ved søgning: 'Results for "pizza"'
  if (filtre.search !== "All") {
    overskrift.textContent = `Results for "${filtre.search}"`;
    introTekst.hidden = true;
    return;
  }

  introTekst.hidden = false;

  // Byg overskriften af køkken og måltid
  let tekst = "";
  if (filtre.cuisine !== "All") {
    tekst = tekst + filtre.cuisine + " ";
  }
  if (filtre.mealType !== "All") {
    tekst = tekst + filtre.mealType + " ";
  }

  if (tekst === "") {
    overskrift.textContent = "ALL RECIPES";
  } else {
    // Fx "ITALIAN DINNER RECIPES"
    overskrift.textContent = (tekst + "RECIPES").toUpperCase();
  }
}

// "See more" viser 12 opskrifter mere
flereKnap.addEventListener("click", () => {
  antalVist = antalVist + antalPrSide;
  visOpskrifter();
});

// Viser opskrift-kortene
function visOpskrifter() {
  // Tøm containeren
  opskriftContainer.innerHTML = "";

  // Tag de første opskrifter fra listen, fx nr. 0-11
  const visesNu = fundneOpskrifter.slice(0, antalVist);

  // Er alle vist, skjules "See more"
  if (antalVist >= fundneOpskrifter.length) {
    flereKnap.hidden = true;
  } else {
    flereKnap.hidden = false;
  }

  // "Request it" er skjult, indtil vi ved, om den skal vises
  ingenFundet.hidden = true;

  // Ingen opskrifter fundet
  if (visesNu.length === 0) {
    // Ved søgning: vis "Request it →"
    if (filtre.search !== "All") {
      visIngenFundet();
      return;
    }

    // Ved filtre: vis en besked
    opskriftContainer.innerHTML = "<p>No recipes match your choice.</p>";
    return;
  }

  // Ét kort pr. opskrift
  visesNu.forEach((opskrift) => {
    opskriftContainer.innerHTML += `
      <article class="recipe-card">
        <img src="${opskrift.image}" alt="${opskrift.name}">

        <div class="recipe-content">
          <h3>${opskrift.name}</h3>

          <p>${opskrift.cuisine}</p>

          <p>Time: ${opskrift.prepTimeMinutes + opskrift.cookTimeMinutes} min</p>

          <a href="recipe.html?id=${opskrift.id}" class="btn-opdag readmore">
            Read more
          </a>
        </div>
      </article>
    `;
  });
}

// Viser "No recipes for ..." og "Request it →"
function visIngenFundet() {
  // Søgeordet i teksten "No recipes for ..."
  document.querySelector("#emptyWord").textContent = filtre.search;

  // Link til request-siden med søgeordet, fx request.html?dish=lasagne
  document.querySelector("#requestLink").href = "request.html?dish=" + filtre.search;

  ingenFundet.hidden = false;
}

// Starter siden
hentData(opskriftURL);

// "Do you dare to try a new cuisine?"
const koekkenBilleder = document.querySelector("#kitchenContainer");

// Henter opskrifterne og sender dem videre til visKoekkener
function hentKoekkener() {
  fetch("https://dummyjson.com/recipes")
    .then((svar) => svar.json())
    .then((data) => visKoekkener(data));
}

// Viser 4 køkkener med et billede og en knap
function visKoekkener(data) {
  // Én opskrift pr. køkken
  const enPrKoekken = {};

  data.recipes.forEach((opskrift) => {
    // Samme køkken overskriver den forrige, så der kun er én tilbage
    enPrKoekken[opskrift.cuisine] = opskrift;
  });

  // Lav objektet om til en liste og tag de første 4
  const valgteKoekkener = Object.values(enPrKoekken).slice(0, 4);

  valgteKoekkener.forEach((opskrift) => {
    // Knappen linker til listview med køkkenet valgt, fx ?cuisine=Italian
    koekkenBilleder.innerHTML += `
      <article class="kitchen-card">
        <img src="${opskrift.image}" alt="${opskrift.cuisine}">

        <a href="listview.html?cuisine=${opskrift.cuisine}" class="btn-tag cuisine-btn">
          ${opskrift.cuisine}
        </a>
      </article>
    `;
  });
}

hentKoekkener();
