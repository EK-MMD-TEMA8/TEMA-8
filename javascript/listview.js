// RECIPES-SIDEN (listview)
// Hele flowet: hent alle opskrifter → læs filtre og søgning fra URL'en
// → vis de opskrifter, der passer. Findes der ingen, kan man ønske retten.

// ---------------------------------------------------------------
// 1. API-adressen
// ---------------------------------------------------------------
// Adressen, hvor alle opskrifterne ligger. limit=0 = hent dem alle (ellers kun 30)
const recipeURL = "https://dummyjson.com/recipes?limit=0";

// ---------------------------------------------------------------
// 2. Find de elementer i HTML'en, vi skal bruge
// querySelector finder et element ud fra dets id (#) eller klasse (.)
// ---------------------------------------------------------------
// Kassen, hvor opskrift-kortene bliver sat ind
const listContainer = document.querySelector("#recipeContainer");
// Overskriften over opskrifterne, fx "ALL RECIPES"
const listTitle = document.querySelector("#listTitle");
// Hele området med filterknapperne
const filterSection = document.querySelector(".filter-section");
// Kassen, hvor køkken-knapperne bliver sat ind
const cuisineButtons = document.querySelector("#cuisineButtons");
// "See more"-knappen under køkkenerne
const cuisineMore = document.querySelector("#cuisineMore");
// "← Back"-knappen
const backButton = document.querySelector("#backButton");
// "See more"-knappen under opskrifterne
const moreButton = document.querySelector(".more-btn");
// Kassen med "No recipes for ..." og "Request it →"
const emptyState = document.querySelector("#emptyState");
// Søgefeltet i headeren
const searchInput = document.querySelector(".search input");
// Teksten "OUR NEWEST RECIPES:"
const introLink = document.querySelector(".intro-section a");

// ---------------------------------------------------------------
// 3. Variabler, som husker ting, mens man er på siden
// ---------------------------------------------------------------
// Her gemmer vi alle opskrifterne fra API'et (tom liste til at starte med)
let allRecipes = [];

// Her gemmer vi de opskrifter, der passer til filtrene lige nu
let currentRecipes = [];

// Vi viser 12 opskrifter ad gangen
const perPage = 12;
// Hvor mange opskrifter der vises lige nu (starter på 12)
let shown = perPage;

// Hvor mange køkken-knapper der vises, før man klikker "See more"
const cuisinesShown = 6;

// Hvor mange gange man har klikket på et filter (starter på 0)
// Er det 0, er der ikke noget at gå tilbage til, så "← Back" skjules
let clicks = 0;

// history.state = det, browseren har gemt om siden.
// Er det ikke tomt, kommer man tilbage fra en opskrift...
if (history.state !== null) {
  // ...så henter vi det antal klik, browseren huskede
  clicks = history.state.clicks;
}

// ---------------------------------------------------------------
// 4. Filtrene
// ---------------------------------------------------------------
// filters er et objekt, der husker, hvad der er valgt, fx:
// { mealType: "Breakfast", cuisine: "All", time: "All", search: "All" }
// "All" betyder "ikke valgt"
const filters = {};

// Læs filtrene fra URL'en med det samme (funktionen står i trin 5)
readFiltersFromURL();

// Er man lige kommet ind på siden (history.state er tom), OG står der et filter i URL'en...
// (fx kom man fra "Breakfast" i headeren: listview.html?mealType=Breakfast)
if (history.state === null && window.location.search !== "") {
  // Gem filteret fra URL'en, fx "?mealType=Breakfast"
  const filteredURL = window.location.search;

  // Lav den nuværende side om til "ALL" i browserens historik
  history.replaceState({ clicks: 0 }, "", window.location.pathname);
  // Læg filteret ovenpå. Så ender "← Back" altid på ALL
  history.pushState({ clicks: 1 }, "", filteredURL);
  // Nu er der ét klik at gå tilbage fra
  clicks = 1;
}

// ---------------------------------------------------------------
// 5. Læs filtrene fra URL'en
// ---------------------------------------------------------------
function readFiltersFromURL() {
  // Læs alt efter ? i adressen, fx ?mealType=Breakfast&search=lasagne
  const params = new URLSearchParams(window.location.search);

  // Hent hvert filter. Står der ikke noget, bliver det "All" (se getFilter nedenfor)
  filters.mealType = getFilter(params, "mealType");
  filters.cuisine = getFilter(params, "cuisine");
  filters.time = getFilter(params, "time");
  filters.search = getFilter(params, "search");

  // Har man ikke søgt...
  if (filters.search === "All") {
    // ...så skal søgefeltet være tomt
    searchInput.value = "";
  } else {
    // ...ellers skriver vi søgeordet i feltet, så man kan se, hvad man søgte på
    searchInput.value = filters.search;
  }
}

// Hent ét filter fra URL'en, fx getFilter(params, "mealType") → "Breakfast"
function getFilter(params, name) {
  // Find værdien i URL'en. Står der ikke noget, får vi null
  const value = params.get(name);

  // Står der ikke noget (null) eller er det tomt ("")...
  if (value === null || value === "") {
    // ...så send "All" tilbage
    return "All";
  }
  // Ellers send værdien tilbage, fx "Breakfast"
  return value;
}

// ---------------------------------------------------------------
// 6. Skriv filtrene ind i URL'en
// Så husker browserens tilbage-pil, hvad man havde valgt.
// ---------------------------------------------------------------
function saveFiltersInURL() {
  // Start med en tom "?..."-del
  const params = new URLSearchParams();

  // Er der valgt et måltid, så skriv det på, fx mealType=Breakfast
  if (filters.mealType !== "All") {
    params.set("mealType", filters.mealType);
  }
  // Er der valgt et køkken, så skriv det på, fx cuisine=Italian
  if (filters.cuisine !== "All") {
    params.set("cuisine", filters.cuisine);
  }
  // Er der valgt en tid, så skriv den på, fx time=Under
  if (filters.time !== "All") {
    params.set("time", filters.time);
  }
  // Har man søgt, så skriv søgeordet på, fx search=pizza
  if (filters.search !== "All") {
    params.set("search", filters.search);
  }

  // Tæl et klik op
  clicks = clicks + 1;
  // Lav et nyt punkt i browserens historik med den nye URL (uden at hente siden igen)
  history.pushState({ clicks: clicks }, "", "?" + params);
}

// ---------------------------------------------------------------
// 7. Hent data fra API'et
// ---------------------------------------------------------------
function getData(url) {
  // fetch = "gå ud og hent" data fra adressen
  fetch(url)
    // Lav svaret om til noget, JavaScript kan læse
    .then((response) => response.json())
    // Når data er klar...
    .then((data) => {
      // Vis data i konsollen (godt til at se, hvad API'et sender)
      console.log(data);
      // Gem alle opskrifterne, så vi kan filtrere dem senere
      allRecipes = data.recipes;
      // Lav køkken-knapperne (trin 8)
      showCuisineButtons();
      // Find og vis de opskrifter, der passer (trin 11)
      filterRecipes();
    });
}

// ---------------------------------------------------------------
// 8. Køkken-knapperne
// ---------------------------------------------------------------
// Knappen "ASIA" dækker alle disse køkkener i API'et
const asianCuisines = ["Asian", "Japanese", "Thai", "Korean", "Vietnamese", "Indian", "Pakistani"];

function showCuisineButtons() {
  // En tom liste, som vi fylder med køkkener
  const cuisines = [];

  // Gå alle opskrifterne igennem én ad gangen
  allRecipes.forEach((recipe) => {
    // Står opskriftens køkken IKKE allerede på listen...
    if (cuisines.includes(recipe.cuisine) === false) {
      // ...så tilføj det. På den måde kommer hvert køkken kun med én gang
      cuisines.push(recipe.cuisine);
    }
  });

  // Sorter listen alfabetisk (American, Asian, Brazilian ...)
  cuisines.sort();

  // Lav en knap for hvert køkken. index = nummeret på listen (0, 1, 2 ...)
  cuisines.forEach((cuisine, index) => {
    // Teksten på knappen er køkkenet med store bogstaver, fx "ITALIAN"
    let label = cuisine.toUpperCase();
    // Men "Asian" skal hedde "ASIA" på knappen
    if (cuisine === "Asian") {
      label = "ASIA";
    }

    // Som udgangspunkt er knappen almindelig (ingen ekstra klasse)
    let extra = "";
    // Er det knap nummer 7 eller derover (index 6+)...
    if (index >= cuisinesShown) {
      // ...så får den klassen "extra" og er skjult, til man klikker "See more"
      extra = "extra";
    }

    // Sæt knappen ind i kassen
    cuisineButtons.innerHTML += `<button class="btn-tag ${extra}" data-filter="cuisine" data-value="${cuisine}">${label}</button>`;
  });

  // Find knappen for det køkken, der er valgt lige nu (fx "Thai")
  const chosenButton = cuisineButtons.querySelector(`[data-value="${filters.cuisine}"]`);
  // Findes den, OG er den en af de skjulte "extra"-knapper...
  if (chosenButton !== null && chosenButton.classList.contains("extra")) {
    // ...så vis alle køkkenerne, så man kan se, hvilken der er valgt
    toggleCuisines();
  }
}

// Vis eller skjul de ekstra køkkener
function toggleCuisines() {
  // Vises de allerede (har kassen klassen "show-all")...
  if (cuisineButtons.classList.contains("show-all")) {
    // ...så skjul dem igen
    cuisineButtons.classList.remove("show-all");
    // ...og skift teksten tilbage til "See more"
    cuisineMore.textContent = "See more";
  } else {
    // Ellers: vis dem
    cuisineButtons.classList.add("show-all");
    // ...og skift teksten til "See less"
    cuisineMore.textContent = "See less";
  }
}

// Når man klikker "See more" under køkkenerne, så kør toggleCuisines
cuisineMore.addEventListener("click", toggleCuisines);

// ---------------------------------------------------------------
// 9. Når man klikker på en filterknap
// ---------------------------------------------------------------
// Vi lytter på hele filter-området, så det også virker for køkken-knapperne,
// der først bliver lavet, når data er hentet
filterSection.addEventListener("click", (event) => {
  // Find den knap, man har klikket på
  const button = event.target.closest("button");

  // Klikkede man ikke på en knap (fx på en overskrift)...
  if (button === null) {
    // ...så stop her
    return;
  }

  // Hvilket filter knappen hører til, fx "mealType"
  const filterName = button.dataset.filter;
  // Hvilken værdi knappen har, fx "Breakfast"
  const filterValue = button.dataset.value;

  // Har knappen ikke noget filter ("See more" og "← Back")...
  if (filterName === undefined) {
    // ...så stop her
    return;
  }

  // Er knappen allerede valgt...
  if (filters[filterName] === filterValue) {
    // ...så sker der ingenting
    return;
  }

  // Gem det nye valg, fx filters.mealType = "Breakfast"
  filters[filterName] = filterValue;
  // Skriv valget ind i URL'en (trin 6)
  saveFiltersInURL();
  // Find og vis de opskrifter, der passer (trin 11)
  filterRecipes();
});

// ---------------------------------------------------------------
// 10. Tilbage
// ---------------------------------------------------------------
// Når man klikker "← Back"...
backButton.addEventListener("click", () => {
  // ...så gør det samme som browserens tilbage-pil
  history.back();
});

// popstate sker, når man går tilbage (eller frem) med browserens pile
window.addEventListener("popstate", (event) => {
  // Har browseren ikke gemt noget om siden...
  if (event.state === null) {
    // ...så er der ingen klik at gå tilbage til
    clicks = 0;
  } else {
    // ...ellers hent det antal klik, den huskede
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
  // En tom liste, som vi fylder med de opskrifter, der passer
  const filtered = [];

  // Gå alle opskrifterne igennem én ad gangen
  allRecipes.forEach((recipe) => {
    // Passer måltid OG køkken OG tid OG søgning (&& = "og")...
    if (mealMatches(recipe) && cuisineMatches(recipe) && timeMatches(recipe) && searchMatches(recipe)) {
      // ...så kommer opskriften med på listen
      filtered.push(recipe);
    }
  });

  // Gem listen med de opskrifter, der passer
  currentRecipes = filtered;
  // Start forfra med at vise de første 12
  shown = perPage;

  // Marker de valgte knapper (trin 12)
  showActiveButtons();
  // Skriv overskriften (trin 13)
  showTitle();
  // Vis opskrifterne (trin 15)
  showRecipes();

  // Er der ikke klikket på noget endnu...
  if (clicks === 0) {
    // ...så er der intet at gå tilbage til, så skjul "← Back"
    backButton.hidden = true;
  } else {
    // ...ellers vis "← Back"
    backButton.hidden = false;
  }
}

// Passer måltidet? Svarer true (ja) eller false (nej)
function mealMatches(recipe) {
  // Er der ikke valgt et måltid, passer alle opskrifter
  if (filters.mealType === "All") {
    return true;
  }

  // Start med at sige "nej"
  let match = false;
  // En opskrift kan have flere måltider, fx ["Lunch", "Dinner"]. Tjek hvert af dem
  recipe.mealType.forEach((type) => {
    // startsWith, fordi API'et både bruger "Snack" og "Snacks"
    if (type.startsWith(filters.mealType)) {
      // Fandt vi måltidet, så sig "ja"
      match = true;
    }
  });
  // Send svaret tilbage
  return match;
}

// Passer køkkenet? Svarer true (ja) eller false (nej)
function cuisineMatches(recipe) {
  // Er der ikke valgt et køkken, passer alle opskrifter
  if (filters.cuisine === "All") {
    return true;
  }

  // Er "ASIA" valgt, passer alle de asiatiske køkkener
  if (filters.cuisine === "Asian") {
    return asianCuisines.includes(recipe.cuisine);
  }

  // Ellers skal køkkenet være præcis det valgte, fx "Italian"
  return recipe.cuisine === filters.cuisine;
}

// Passer tiden? Svarer true (ja) eller false (nej)
function timeMatches(recipe) {
  // Den samlede tid = forberedelse + tilberedning
  const time = recipe.prepTimeMinutes + recipe.cookTimeMinutes;

  // Er "Under 30 min" valgt, passer den, hvis tiden er under 30
  if (filters.time === "Under") {
    return time < 30;
  }
  // Er "Over 30 min" valgt, passer den, hvis tiden er 30 eller mere
  if (filters.time === "Over") {
    return time >= 30;
  }
  // Er der ikke valgt en tid ("All"), passer alle opskrifter
  return true;
}

// Passer søgningen? Svarer true (ja) eller false (nej)
function searchMatches(recipe) {
  // Har man ikke søgt, passer alle opskrifter
  if (filters.search === "All") {
    return true;
  }

  // Sæt navn og tags sammen til én tekst, fx "Classic Margherita Pizza Pizza Italian"
  // toLowerCase = lav det til små bogstaver, så "Lasagne" og "lasagne" giver det samme
  const searchText = (recipe.name + " " + recipe.tags.join(" ")).toLowerCase();
  // Står søgeordet et sted i teksten?
  return searchText.includes(filters.search.toLowerCase());
}

// ---------------------------------------------------------------
// 12. Marker de valgte knapper
// ---------------------------------------------------------------
function showActiveButtons() {
  // Find alle filterknapperne
  const buttons = document.querySelectorAll(".filter-buttons button");

  // Gå knapperne igennem én ad gangen
  buttons.forEach((button) => {
    // Er knappens værdi den, der er valgt i filteret...
    if (filters[button.dataset.filter] === button.dataset.value) {
      // ...så giv den klassen "active" (den bliver blå)
      button.classList.add("active");
    } else {
      // ...ellers fjern klassen
      button.classList.remove("active");
    }
  });
}

// ---------------------------------------------------------------
// 13. Overskriften
// ---------------------------------------------------------------
function showTitle() {
  // Har man søgt...
  if (filters.search !== "All") {
    // ...så står søgeordet i overskriften, fx 'Results for "pizza"'
    listTitle.textContent = `Results for "${filters.search}"`;
    // "OUR NEWEST RECIPES:" passer ikke til en søgning, så skjul den
    introLink.hidden = true;
    // Stop her
    return;
  }

  // Ingen søgning: vis "OUR NEWEST RECIPES:"
  introLink.hidden = false;

  // Byg overskriften op, start med tom tekst
  let title = "";
  // Er der valgt et køkken, så sæt det på, fx "Italian "
  if (filters.cuisine !== "All") {
    title = title + filters.cuisine + " ";
  }
  // Er der valgt et måltid, så sæt det på, fx "Italian Dinner "
  if (filters.mealType !== "All") {
    title = title + filters.mealType + " ";
  }

  // Er der hverken valgt køkken eller måltid...
  if (title === "") {
    // ...så står der "ALL RECIPES"
    listTitle.textContent = "ALL RECIPES";
  } else {
    // ...ellers fx "ITALIAN DINNER RECIPES" (toUpperCase = store bogstaver)
    listTitle.textContent = (title + "RECIPES").toUpperCase();
  }
}

// ---------------------------------------------------------------
// 14. "See more" under opskrifterne
// ---------------------------------------------------------------
// Når man klikker "See more"...
moreButton.addEventListener("click", () => {
  // ...så vis 12 opskrifter mere
  shown = shown + perPage;
  // ...og tegn opskrifterne igen
  showRecipes();
});

// ---------------------------------------------------------------
// 15. Vis opskrifterne – eller "Request it", hvis der ingen er
// Her bestemmes det, om retten findes:
// - Der er opskrifter → lav et kort for hver
// - Ingen opskrifter + man har søgt → vis "Request it →"
// - Ingen opskrifter + kun filtre → "No recipes match your choice."
// ---------------------------------------------------------------
function showRecipes() {
  // Tøm kassen, før vi fylder den igen
  listContainer.innerHTML = "";

  // Tag kun de første opskrifter fra listen, fx nr. 0-12 (slice = skær ud)
  const recipes = currentRecipes.slice(0, shown);

  // shown = hvor mange vi viser lige nu (fx 12)
  // currentRecipes.length = hvor mange der er i alt (fx 30)
  // Viser vi allerede dem alle...
  if (shown >= currentRecipes.length) {
    // ...så er der ikke flere at se, så skjul "See more"
    moreButton.hidden = true;
  } else {
    // ...ellers er der flere tilbage, så vis "See more"
    moreButton.hidden = false;
  }

  // Skjul "Request it" til at starte med (den vises kun ved en tom søgning)
  emptyState.hidden = true;

  // Blev der ikke fundet nogen opskrifter (recipes.length = antal)...
  if (recipes.length === 0) {
    // ...og har man søgt på noget, vi ikke har...
    if (filters.search !== "All") {
      // ...så vis "Request it →" (trin 16)
      showEmptyState();
      // Stop her, så der ikke laves kort af ingenting
      return;
    }

    // Har man kun valgt filtre, så skriv bare en besked
    listContainer.innerHTML = "<p>No recipes match your choice.</p>";
    // Stop her
    return;
  }

  // Gå opskrifterne igennem én ad gangen og lav et kort for hver
  recipes.forEach((recipe) => {
    // += = sæt kortet ind efter dem, der allerede er der
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
// 16. Tom søgning: vis "Request it →"
// ---------------------------------------------------------------
function showEmptyState() {
  // Skriv søgeordet ind i teksten "No recipes for ..."
  document.querySelector("#emptyWord").textContent = filters.search;

  // Lav linket til request-siden med søgeordet, fx request.html?dish=lasagne
  // encodeURIComponent gør, at mellemrum og æøå ikke ødelægger URL'en
  document.querySelector("#requestLink").href = "request.html?dish=" + encodeURIComponent(filters.search);

  // Vis kassen med "Request it →"
  emptyState.hidden = false;
}

// ---------------------------------------------------------------
// 17. Start det hele
// ---------------------------------------------------------------
// Funktionerne ovenfor gør ingenting, før de bliver kaldt.
// Denne linje henter opskrifterne og sætter det hele i gang
getData(recipeURL);

// ---------------------------------------------------------------
// 18. "Do you dare to try a new cuisine?" nederst på siden
// ---------------------------------------------------------------
// Kassen, hvor de runde køkken-billeder bliver sat ind
const kitchenContainer = document.querySelector("#kitchenContainer");

// Hent opskrifterne
fetch("https://dummyjson.com/recipes")
  // Lav svaret om til noget, JavaScript kan læse
  .then((response) => response.json())
  // Når data er klar...
  .then((data) => {
    // Et tomt objekt, hvor vi gemmer én opskrift pr. køkken
    const oneRecipePerCuisine = {};

    // Gå alle opskrifterne igennem
    data.recipes.forEach((recipe) => {
      // Gem opskriften under køkkenets navn, fx oneRecipePerCuisine["Italian"]
      // Kommer samme køkken igen, bliver den gamle bare overskrevet
      oneRecipePerCuisine[recipe.cuisine] = recipe;
    });

    // Lav objektet om til en almindelig liste med opskrifter
    const cuisines = Object.values(oneRecipePerCuisine);
    // Tag kun de første 4
    const selectedCuisines = cuisines.slice(0, 4);

    // Lav et rundt billede + knap for hvert af de 4 køkkener
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
