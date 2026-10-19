// RECIPES-SIDEN (listview)
// Henter alle opskrifter, læser filtre og søgning fra URL'en og viser de opskrifter, der passer.
// Giver en søgning ingen resultater, vises et link til request-siden.

// ---------------------------------------------------------------
// 1. API-adresse
// ---------------------------------------------------------------
// limit=0 henter alle opskrifter (standard er 30)
const recipeURL = "https://dummyjson.com/recipes?limit=0";

// ---------------------------------------------------------------
// 2. Elementer fra HTML'en
// ---------------------------------------------------------------
// Container til opskrift-kortene
const listContainer = document.querySelector("#recipeContainer");
// Overskrift over opskrifterne
const listTitle = document.querySelector("#listTitle");
// Området med filterknapper
const filterSection = document.querySelector(".filter-section");
// Container til køkken-knapperne
const cuisineButtons = document.querySelector("#cuisineButtons");
// "See more"-knap under køkkenerne
const cuisineMore = document.querySelector("#cuisineMore");
// "← Back"-knap
const backButton = document.querySelector("#backButton");
// "See more"-knap under opskrifterne
const moreButton = document.querySelector(".more-btn");
// Boks med "No recipes for ..." og "Request it →"
const emptyState = document.querySelector("#emptyState");
// Søgefeltet i headeren
const searchInput = document.querySelector(".search input");
// Teksten "OUR NEWEST RECIPES:"
const introLink = document.querySelector(".intro-section a");

// ---------------------------------------------------------------
// 3. Variabler
// ---------------------------------------------------------------
// Alle opskrifter fra API'et
let allRecipes = [];

// Opskrifter, der passer til de valgte filtre
let currentRecipes = [];

// Antal opskrifter pr. "See more"
const perPage = 12;
// Antal opskrifter, der vises nu
let shown = perPage;

// Antal køkken-knapper, der vises før "See more"
const cuisinesShown = 6;

// Antal klik på filtre. Ved 0 skjules "← Back"
let clicks = 0;

// history.state er sat, når man kommer tilbage fra en opskrift
if (history.state !== null) {
  // Brug det gemte antal klik
  clicks = history.state.clicks;
}

// ---------------------------------------------------------------
// 4. Filtre
// ---------------------------------------------------------------
// Det valgte i hvert filter, fx { mealType: "Breakfast", cuisine: "All", time: "All", search: "All" }
// "All" = intet valgt
const filters = {};

// Læs filtrene fra URL'en (trin 5)
readFiltersFromURL();

// Første besøg med et filter i URL'en (fx fra "Breakfast" i headeren)
if (history.state === null && window.location.search !== "") {
  // Gem filteret, fx "?mealType=Breakfast"
  const filteredURL = window.location.search;

  // Gør den nuværende side til "ALL" i historikken
  history.replaceState({ clicks: 0 }, "", window.location.pathname);
  // Læg filteret ovenpå, så "← Back" ender på ALL
  history.pushState({ clicks: 1 }, "", filteredURL);
  // Ét klik at gå tilbage fra
  clicks = 1;
}

// ---------------------------------------------------------------
// 5. Læs filtrene fra URL'en
// ---------------------------------------------------------------
function readFiltersFromURL() {
  // Delen efter ? i adressen, fx ?mealType=Breakfast&search=lasagne
  const params = new URLSearchParams(window.location.search);

  // Hent hvert filter. Mangler det, bliver det "All"
  filters.mealType = getFilter(params, "mealType");
  filters.cuisine = getFilter(params, "cuisine");
  filters.time = getFilter(params, "time");
  filters.search = getFilter(params, "search");

  // Ingen søgning: tomt søgefelt
  if (filters.search === "All") {
    searchInput.value = "";
  } else {
    // Ellers vises søgeordet i feltet
    searchInput.value = filters.search;
  }
}

// Returnerer værdien af ét filter fra URL'en, eller "All" hvis det mangler
function getFilter(params, name) {
  // null, hvis filteret ikke står i URL'en
  const value = params.get(name);

  // Mangler eller tom
  if (value === null || value === "") {
    return "All";
  }
  // Fx "Breakfast"
  return value;
}

// ---------------------------------------------------------------
// 6. Skriv filtrene i URL'en
// Så browserens tilbage-pil husker valgene
// ---------------------------------------------------------------
function saveFiltersInURL() {
  // Tom "?..."-del
  const params = new URLSearchParams();

  // Kun valgte filtre (ikke "All") kommer med
  if (filters.mealType !== "All") {
    params.set("mealType", filters.mealType);
  }
  if (filters.cuisine !== "All") {
    params.set("cuisine", filters.cuisine);
  }
  if (filters.time !== "All") {
    params.set("time", filters.time);
  }
  if (filters.search !== "All") {
    params.set("search", filters.search);
  }

  // Tæl klik op
  clicks = clicks + 1;
  // Nyt punkt i historikken med den nye URL (siden genindlæses ikke)
  history.pushState({ clicks: clicks }, "", "?" + params);
}

// ---------------------------------------------------------------
// 7. Hent data fra API'et
// ---------------------------------------------------------------
function getData(url) {
  // Hent data fra adressen
  fetch(url)
    // Lav svaret om til JavaScript-data
    .then((response) => response.json())
    // Når data er klar
    .then((data) => {
      // Vis data i konsollen
      console.log(data);
      // Gem alle opskrifter
      allRecipes = data.recipes;
      // Lav køkken-knapperne (trin 8)
      showCuisineButtons();
      // Vis de opskrifter, der passer (trin 11)
      filterRecipes();
    });
}

// ---------------------------------------------------------------
// 8. Køkken-knapper
// ---------------------------------------------------------------
// Køkkener, som "ASIA"-knappen dækker
const asianCuisines = ["Asian", "Japanese", "Thai", "Korean", "Vietnamese", "Indian", "Pakistani"];

function showCuisineButtons() {
  // Liste med hvert køkken én gang
  const cuisines = [];

  // Gennemgå alle opskrifter
  allRecipes.forEach((recipe) => {
    // Tilføj køkkenet, hvis det ikke allerede er på listen
    if (cuisines.includes(recipe.cuisine) === false) {
      cuisines.push(recipe.cuisine);
    }
  });

  // Sorter alfabetisk
  cuisines.sort();

  // Én knap pr. køkken. index = placering på listen (0, 1, 2 ...)
  cuisines.forEach((cuisine, index) => {
    // Knaptekst med store bogstaver, fx "ITALIAN"
    let label = cuisine.toUpperCase();
    // "Asian" vises som "ASIA"
    if (cuisine === "Asian") {
      label = "ASIA";
    }

    // Ingen ekstra klasse som udgangspunkt
    let extra = "";
    // Knap 7 og frem får klassen "extra" og er skjult indtil "See more"
    if (index >= cuisinesShown) {
      extra = "extra";
    }

    // Indsæt knappen
    cuisineButtons.innerHTML += `<button class="btn-tag ${extra}" data-filter="cuisine" data-value="${cuisine}">${label}</button>`;
  });

  // Knappen for det valgte køkken, fx "Thai"
  const chosenButton = cuisineButtons.querySelector(`[data-value="${filters.cuisine}"]`);
  // Er den valgte knap skjult, vises alle køkkener
  if (chosenButton !== null && chosenButton.classList.contains("extra")) {
    toggleCuisines();
  }
}

// Vis eller skjul de ekstra køkkener
function toggleCuisines() {
  // Vises de allerede
  if (cuisineButtons.classList.contains("show-all")) {
    // Skjul dem
    cuisineButtons.classList.remove("show-all");
    cuisineMore.textContent = "See more";
  } else {
    // Vis dem
    cuisineButtons.classList.add("show-all");
    cuisineMore.textContent = "See less";
  }
}

// Klik på "See more" under køkkenerne
cuisineMore.addEventListener("click", toggleCuisines);

// ---------------------------------------------------------------
// 9. Klik på en filterknap
// ---------------------------------------------------------------
// Lytter på hele filter-området, så det også virker for køkken-knapperne,
// der først laves, når data er hentet
filterSection.addEventListener("click", (event) => {
  // Den knap, der blev klikket på
  const button = event.target.closest("button");

  // Klik uden for en knap
  if (button === null) {
    return;
  }

  // Filtrets navn, fx "mealType"
  const filterName = button.dataset.filter;
  // Knappens værdi, fx "Breakfast"
  const filterValue = button.dataset.value;

  // Knapper uden filter ("See more" og "← Back")
  if (filterName === undefined) {
    return;
  }

  // Knappen er allerede valgt
  if (filters[filterName] === filterValue) {
    return;
  }

  // Gem valget, fx filters.mealType = "Breakfast"
  filters[filterName] = filterValue;
  // Skriv valget i URL'en (trin 6)
  saveFiltersInURL();
  // Vis de opskrifter, der passer (trin 11)
  filterRecipes();
});

// ---------------------------------------------------------------
// 10. Tilbage
// ---------------------------------------------------------------
// "← Back" gør det samme som browserens tilbage-pil
backButton.addEventListener("click", () => {
  history.back();
});

// popstate: man er gået tilbage eller frem med browserens pile
window.addEventListener("popstate", (event) => {
  // Intet gemt = ingen klik at gå tilbage til
  if (event.state === null) {
    clicks = 0;
  } else {
    // Brug det gemte antal klik
    clicks = event.state.clicks;
  }

  // Læs filtrene fra den nye URL
  readFiltersFromURL();
  // Vis de opskrifter, der passer
  filterRecipes();
});

// ---------------------------------------------------------------
// 11. Find de opskrifter, der passer
// ---------------------------------------------------------------
function filterRecipes() {
  // Opskrifter, der passer
  const filtered = [];

  // Gennemgå alle opskrifter
  allRecipes.forEach((recipe) => {
    // Måltid, køkken, tid og søgning skal alle passe (&& = og)
    if (mealMatches(recipe) && cuisineMatches(recipe) && timeMatches(recipe) && searchMatches(recipe)) {
      filtered.push(recipe);
    }
  });

  // Gem resultatet
  currentRecipes = filtered;
  // Start forfra med 12
  shown = perPage;

  // Marker valgte knapper (trin 12)
  showActiveButtons();
  // Opdater overskriften (trin 13)
  showTitle();
  // Vis opskrifterne (trin 15)
  showRecipes();

  // Ingen klik: skjul "← Back"
  if (clicks === 0) {
    backButton.hidden = true;
  } else {
    backButton.hidden = false;
  }
}

// Passer måltidet? (true/false)
function mealMatches(recipe) {
  // Intet måltid valgt: alle passer
  if (filters.mealType === "All") {
    return true;
  }

  let match = false;
  // En opskrift kan have flere måltider, fx ["Lunch", "Dinner"]
  recipe.mealType.forEach((type) => {
    // startsWith, fordi API'et bruger både "Snack" og "Snacks"
    if (type.startsWith(filters.mealType)) {
      match = true;
    }
  });
  return match;
}

// Passer køkkenet? (true/false)
function cuisineMatches(recipe) {
  // Intet køkken valgt: alle passer
  if (filters.cuisine === "All") {
    return true;
  }

  // "ASIA" passer til alle asiatiske køkkener
  if (filters.cuisine === "Asian") {
    return asianCuisines.includes(recipe.cuisine);
  }

  // Ellers skal køkkenet være det valgte
  return recipe.cuisine === filters.cuisine;
}

// Passer tiden? (true/false)
function timeMatches(recipe) {
  // Samlet tid = forberedelse + tilberedning
  const time = recipe.prepTimeMinutes + recipe.cookTimeMinutes;

  // "Under 30 min"
  if (filters.time === "Under") {
    return time < 30;
  }
  // "Over 30 min"
  if (filters.time === "Over") {
    return time >= 30;
  }
  // "All": alle passer
  return true;
}

// Passer søgningen? (true/false)
function searchMatches(recipe) {
  // Ingen søgning: alle passer
  if (filters.search === "All") {
    return true;
  }

  // Navn og tags samlet i én tekst med små bogstaver (så store/små bogstaver er ligegyldige)
  const searchText = (recipe.name + " " + recipe.tags.join(" ")).toLowerCase();
  // Indeholder teksten søgeordet?
  return searchText.includes(filters.search.toLowerCase());
}

// ---------------------------------------------------------------
// 12. Marker valgte knapper
// ---------------------------------------------------------------
function showActiveButtons() {
  // Alle filterknapper
  const buttons = document.querySelectorAll(".filter-buttons button");

  buttons.forEach((button) => {
    // Den valgte knap får klassen "active"
    if (filters[button.dataset.filter] === button.dataset.value) {
      button.classList.add("active");
    } else {
      button.classList.remove("active");
    }
  });
}

// ---------------------------------------------------------------
// 13. Overskrift
// ---------------------------------------------------------------
function showTitle() {
  // Ved søgning: 'Results for "pizza"'
  if (filters.search !== "All") {
    listTitle.textContent = `Results for "${filters.search}"`;
    // "OUR NEWEST RECIPES:" skjules ved søgning
    introLink.hidden = true;
    return;
  }

  // Uden søgning vises "OUR NEWEST RECIPES:"
  introLink.hidden = false;

  // Byg overskriften af køkken og måltid
  let title = "";
  // Fx "Italian "
  if (filters.cuisine !== "All") {
    title = title + filters.cuisine + " ";
  }
  // Fx "Italian Dinner "
  if (filters.mealType !== "All") {
    title = title + filters.mealType + " ";
  }

  // Intet valgt: "ALL RECIPES"
  if (title === "") {
    listTitle.textContent = "ALL RECIPES";
  } else {
    // Fx "ITALIAN DINNER RECIPES"
    listTitle.textContent = (title + "RECIPES").toUpperCase();
  }
}

// ---------------------------------------------------------------
// 14. "See more" under opskrifterne
// ---------------------------------------------------------------
moreButton.addEventListener("click", () => {
  // 12 opskrifter mere
  shown = shown + perPage;
  showRecipes();
});

// ---------------------------------------------------------------
// 15. Vis opskrifterne
// - Opskrifter fundet → ét kort pr. opskrift
// - Ingen fundet ved søgning → "Request it →"
// - Ingen fundet ved filtre → "No recipes match your choice."
// ---------------------------------------------------------------
function showRecipes() {
  // Tøm containeren
  listContainer.innerHTML = "";

  // De første opskrifter på listen, fx nr. 0-12
  const recipes = currentRecipes.slice(0, shown);

  // shown = antal viste, currentRecipes.length = antal i alt
  // Alle er vist: skjul "See more"
  if (shown >= currentRecipes.length) {
    moreButton.hidden = true;
  } else {
    moreButton.hidden = false;
  }

  // "Request it" er skjult som udgangspunkt
  emptyState.hidden = true;

  // Ingen opskrifter fundet
  if (recipes.length === 0) {
    // Ved søgning: vis "Request it →" (trin 16)
    if (filters.search !== "All") {
      showEmptyState();
      return;
    }

    // Ved filtre: vis en besked
    listContainer.innerHTML = "<p>No recipes match your choice.</p>";
    return;
  }

  // Ét kort pr. opskrift
  recipes.forEach((recipe) => {
    // += tilføjer kortet efter de eksisterende
    listContainer.innerHTML += `
      <article class="recipe-card">
        <img src="${recipe.image}" alt="${recipe.name}">

        <div class="recipe-content">
          <h3>${recipe.name}</h3>

          <p>${recipe.cuisine}</p>

          <p>Time: ${recipe.prepTimeMinutes + recipe.cookTimeMinutes} min</p>

          <a href="recipe.html?id=${recipe.id}" class="btn-opdag readmore">
            Read more
          </a>
        </div>
      </article>
    `;
  });
}

// ---------------------------------------------------------------
// 16. Tom søgning: "Request it →"
// ---------------------------------------------------------------
function showEmptyState() {
  // Søgeordet i teksten "No recipes for ..."
  document.querySelector("#emptyWord").textContent = filters.search;

  // Link til request-siden med søgeordet, fx request.html?dish=lasagne
  // encodeURIComponent sørger for, at mellemrum og æøå virker i URL'en
  document.querySelector("#requestLink").href = "request.html?dish=" + encodeURIComponent(filters.search);

  // Vis boksen
  emptyState.hidden = false;
}

// ---------------------------------------------------------------
// 17. Start
// ---------------------------------------------------------------
// Henter opskrifterne og starter siden
getData(recipeURL);

// ---------------------------------------------------------------
// 18. "Do you dare to try a new cuisine?"
// ---------------------------------------------------------------
// Container til køkken-billederne
const kitchenContainer = document.querySelector("#kitchenContainer");

// Hent opskrifterne
fetch("https://dummyjson.com/recipes")
  // Lav svaret om til JavaScript-data
  .then((response) => response.json())
  .then((data) => {
    // Én opskrift pr. køkken
    const oneRecipePerCuisine = {};

    data.recipes.forEach((recipe) => {
      // Gemmes under køkkenets navn. Samme køkken overskriver den forrige
      oneRecipePerCuisine[recipe.cuisine] = recipe;
    });

    // Lav objektet om til en liste
    const cuisines = Object.values(oneRecipePerCuisine);
    // De første 4
    const selectedCuisines = cuisines.slice(0, 4);

    // Ét rundt billede + knap pr. køkken
    selectedCuisines.forEach((recipe) => {
      // Knappen linker til listview med køkkenet valgt, fx ?cuisine=Italian
      kitchenContainer.innerHTML += `
        <article class="kitchen-card">
          <img src="${recipe.image}" alt="${recipe.cuisine}">

          <a
            href="listview.html?cuisine=${recipe.cuisine}"
            class="btn-tag cuisine-btn"
          >
            ${recipe.cuisine}
          </a>
        </article>
      `;
    });
  });
