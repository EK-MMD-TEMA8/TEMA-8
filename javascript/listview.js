// Henter alle opskrifter, læser filtre og søgning fra URL'en og viser de opskrifter, der passer.
// Giver en søgning ingen resultater, vises et link til request-siden.

// limit=0 henter alle opskrifter
const recipesURL = "https://dummyjson.com/recipes?limit=0";

// Her kommer opskrift-kortene ind
const recipeContainer = document.querySelector("#recipeContainer");
// Overskriften over opskrifterne
const listTitle = document.querySelector("#listTitle");
// Her kommer køkken-knapperne ind
const cuisineButtons = document.querySelector("#cuisineButtons");
// "See more" under køkkenerne
const cuisineMoreButton = document.querySelector("#cuisineMore");
// "← Back"-knappen
const backButton = document.querySelector("#backButton");
// "See more" under opskrifterne
const moreButton = document.querySelector(".more-btn");
// Boksen med "No recipes for ..." og "Request it →"
const emptyState = document.querySelector("#emptyState");
// Søgefeltet i headeren
const searchInput = document.querySelector(".search input");
// Teksten "OUR NEWEST RECIPES:"
const introText = document.querySelector(".intro-section a");

// Alle opskrifter fra API'et
let allRecipes = [];
// De opskrifter, der passer til filtrene
let foundRecipes = [];

// Hvor mange opskrifter der vises ad gangen
const recipesPerPage = 12;
// Hvor mange der vises lige nu
let shownCount = recipesPerPage;

// Hvor mange køkken-knapper der vises før "See more"
const visibleCuisineCount = 6;

// Det, der er valgt i hvert filter. "All" betyder, at intet er valgt
const filters = {
  mealType: "All",
  cuisine: "All",
  time: "All",
  search: "All",
};

readFiltersFromURL();

// Læser filtrene fra adressen
function readFiltersFromURL() {
  // Delen efter ? i adressen, fx ?mealType=Breakfast&search=lasagne
  const urlParams = new URLSearchParams(window.location.search);

  filters.mealType = getFilter(urlParams, "mealType");
  filters.cuisine = getFilter(urlParams, "cuisine");
  filters.time = getFilter(urlParams, "time");
  filters.search = getFilter(urlParams, "search");

  // Vis søgeordet i søgefeltet, eller tøm feltet
  if (filters.search === "All") {
    searchInput.value = "";
  } else {
    searchInput.value = filters.search;
  }
}

// Henter ét filter fra adressen. Mangler det, bliver det "All"
function getFilter(urlParams, name) {
  const value = urlParams.get(name);

  if (value === null || value === "") {
    return "All";
  }
  return value;
}

// Går til listview med de valgte filtre i adressen, fx listview.html?mealType=Breakfast
function goToFilters() {
  const urlParams = new URLSearchParams();

  // Kun filtre, der er valgt, kommer med i adressen
  if (filters.mealType !== "All") {
    urlParams.set("mealType", filters.mealType);
  }
  if (filters.cuisine !== "All") {
    urlParams.set("cuisine", filters.cuisine);
  }
  if (filters.time !== "All") {
    urlParams.set("time", filters.time);
  }
  if (filters.search !== "All") {
    urlParams.set("search", filters.search);
  }

  window.location.href = "listview.html?" + urlParams;
}

// Henter opskrifterne fra API'et
function fetchData(url) {
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      allRecipes = data.recipes;
      showCuisineButtons();
      addFilterButtonClicks();
      findRecipes();
    });
}

// Køkkener, som "ASIA"-knappen dækker
const asianCuisines = ["Asian", "Japanese", "Thai", "Korean", "Vietnamese", "Indian", "Pakistani"];

// Laver én knap pr. køkken
function showCuisineButtons() {
  // Liste med hvert køkken én gang
  const cuisines = [];

  allRecipes.forEach((recipe) => {
    // Tilføj køkkenet, hvis det ikke allerede er på listen
    if (cuisines.includes(recipe.cuisine) === false) {
      cuisines.push(recipe.cuisine);
    }
  });

  // Sorter alfabetisk
  cuisines.sort();

  // index = placering på listen (0, 1, 2 ...)
  cuisines.forEach((cuisine, index) => {
    // Knaptekst med store bogstaver, fx "ITALIAN"
    let buttonText = cuisine.toUpperCase();
    if (cuisine === "Asian") {
      buttonText = "ASIA";
    }

    // Knap 7 og frem får klassen "extra" og er skjult indtil "See more"
    let extraClass = "";
    if (index >= visibleCuisineCount) {
      extraClass = "extra";
    }

    cuisineButtons.innerHTML += `<button class="btn-tag ${extraClass}" data-filter="cuisine" data-value="${cuisine}">${buttonText}</button>`;
  });

  // Er det valgte køkken en af de skjulte knapper, vises alle køkkener
  const selectedButton = cuisineButtons.querySelector(`[data-value="${filters.cuisine}"]`);
  if (selectedButton !== null && selectedButton.classList.contains("extra")) {
    toggleCuisines();
  }
}

// Viser eller skjuler de ekstra køkkener
function toggleCuisines() {
  if (cuisineButtons.classList.contains("show-all")) {
    cuisineButtons.classList.remove("show-all");
    cuisineMoreButton.textContent = "See more";
  } else {
    cuisineButtons.classList.add("show-all");
    cuisineMoreButton.textContent = "See less";
  }
}

cuisineMoreButton.addEventListener("click", toggleCuisines);

// Giver hver filterknap en klik-funktion
// Kaldes efter køkken-knapperne er lavet, så de også kommer med
function addFilterButtonClicks() {
  const buttons = document.querySelectorAll(".filter-buttons button");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      // Fx "mealType" og "Breakfast"
      const filterName = button.getAttribute("data-filter");
      const filterValue = button.getAttribute("data-value");

      // Knappen er allerede valgt
      if (filters[filterName] === filterValue) {
        return;
      }

      // Gem valget, fx filters.mealType = "Breakfast"
      filters[filterName] = filterValue;
      goToFilters();
    });
  });
}

// "← Back" går til siden uden filtre (ALL RECIPES)
backButton.addEventListener("click", () => {
  window.location.href = "listview.html";
});

// Finder de opskrifter, der passer til filtrene, og viser dem
function findRecipes() {
  const matches = [];

  allRecipes.forEach((recipe) => {
    // Måltid, køkken, tid og søgning skal alle passe (&& = og)
    if (mealTypeMatches(recipe) && cuisineMatches(recipe) && timeMatches(recipe) && searchMatches(recipe)) {
      matches.push(recipe);
    }
  });

  foundRecipes = matches;

  markSelectedButtons();
  showTitle();
  showRecipes();

  // Intet filter valgt: man er på ALL RECIPES, så "← Back" skjules
  if (filters.mealType === "All" && filters.cuisine === "All" && filters.time === "All" && filters.search === "All") {
    backButton.hidden = true;
  } else {
    backButton.hidden = false;
  }
}

// Passer måltidet? (true/false)
function mealTypeMatches(recipe) {
  if (filters.mealType === "All") {
    return true;
  }

  let matches = false;
  // En opskrift kan have flere måltider, fx ["Lunch", "Dinner"]
  recipe.mealType.forEach((meal) => {
    // includes, fordi API'et bruger både "Snack" og "Snacks"
    if (meal.includes(filters.mealType)) {
      matches = true;
    }
  });
  return matches;
}

// Passer køkkenet? (true/false)
function cuisineMatches(recipe) {
  if (filters.cuisine === "All") {
    return true;
  }

  // "ASIA" passer til alle asiatiske køkkener
  if (filters.cuisine === "Asian") {
    return asianCuisines.includes(recipe.cuisine);
  }

  return recipe.cuisine === filters.cuisine;
}

// Passer tiden? (true/false)
function timeMatches(recipe) {
  // Samlet tid = forberedelse + tilberedning
  const totalTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes;

  if (filters.time === "Under") {
    return totalTime < 30;
  }
  if (filters.time === "Over") {
    return totalTime >= 30;
  }
  return true;
}

// Passer søgningen? (true/false)
function searchMatches(recipe) {
  if (filters.search === "All") {
    return true;
  }

  // Søgeordet med små bogstaver
  const searchWord = filters.search.toLowerCase();

  // Starter som false. Bliver true, hvis søgeordet findes
  let matches = false;

  // Står søgeordet i navnet?
  if (recipe.name.toLowerCase().includes(searchWord)) {
    matches = true;
  }

  // Står søgeordet i et af tags?
  recipe.tags.forEach((tag) => {
    if (tag.toLowerCase().includes(searchWord)) {
      matches = true;
    }
  });

  // Står søgeordet i en af ingredienserne?
  recipe.ingredients.forEach((ingredient) => {
    if (ingredient.toLowerCase().includes(searchWord)) {
      matches = true;
    }
  });

  return matches;
}

// Giver den valgte knap i hvert filter klassen "active"
function markSelectedButtons() {
  const buttons = document.querySelectorAll(".filter-buttons button");

  buttons.forEach((button) => {
    const filterName = button.getAttribute("data-filter");
    const filterValue = button.getAttribute("data-value");

    if (filters[filterName] === filterValue) {
      button.classList.add("active");
    } else {
      button.classList.remove("active");
    }
  });
}

// Skriver overskriften over opskrifterne
function showTitle() {
  // Ved søgning: 'Results for "pizza"'
  if (filters.search !== "All") {
    listTitle.textContent = `Results for "${filters.search}"`;
    introText.hidden = true;
    return;
  }

  introText.hidden = false;

  // Byg overskriften af køkken og måltid
  let text = "";
  if (filters.cuisine !== "All") {
    text = text + filters.cuisine + " ";
  }
  if (filters.mealType !== "All") {
    text = text + filters.mealType + " ";
  }

  if (text === "") {
    listTitle.textContent = "ALL RECIPES";
  } else {
    // Fx "ITALIAN DINNER RECIPES"
    listTitle.textContent = (text + "RECIPES").toUpperCase();
  }
}

// "See more" viser 12 opskrifter mere
moreButton.addEventListener("click", () => {
  shownCount = shownCount + recipesPerPage;
  showRecipes();
});

// Viser opskrift-kortene
function showRecipes() {
  // Tøm containeren
  recipeContainer.innerHTML = "";

  // Tag de første opskrifter fra listen, fx nr. 0-11
  const shownNow = foundRecipes.slice(0, shownCount);

  // Er alle vist, skjules "See more"
  if (shownCount >= foundRecipes.length) {
    moreButton.hidden = true;
  } else {
    moreButton.hidden = false;
  }

  // "Request it" er skjult, indtil vi ved, om den skal vises
  emptyState.hidden = true;

  // Ingen opskrifter fundet
  if (shownNow.length === 0) {
    // Ved søgning: vis "Request it →"
    if (filters.search !== "All") {
      showEmptyState();
      return;
    }

    // Ved filtre: vis en besked
    recipeContainer.innerHTML = "<p>No recipes match your choice.</p>";
    return;
  }

  // Ét kort pr. opskrift
  shownNow.forEach((recipe) => {
    recipeContainer.innerHTML += `
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

// Viser "No recipes for ..." og "Request it →"
function showEmptyState() {
  // Søgeordet i teksten "No recipes for ..."
  document.querySelector("#emptyWord").textContent = filters.search;

  // Link til request-siden med søgeordet, fx request.html?dish=lasagne
  document.querySelector("#requestLink").href = "request.html?dish=" + filters.search;

  emptyState.hidden = false;
}

// Starter siden
fetchData(recipesURL);

// "Do you dare to try a new cuisine?"
const kitchenContainer = document.querySelector("#kitchenContainer");

// Henter opskrifterne og sender dem videre til showCuisines
function fetchCuisines() {
  fetch("https://dummyjson.com/recipes")
    .then((response) => response.json())
    .then((data) => showCuisines(data));
}

// Viser 4 køkkener med et billede og en knap
function showCuisines(data) {
  // Én opskrift pr. køkken
  const onePerCuisine = {};

  data.recipes.forEach((recipe) => {
    // Samme køkken overskriver den forrige, så der kun er én tilbage
    onePerCuisine[recipe.cuisine] = recipe;
  });

  // Lav objektet om til en liste og tag de første 4
  const selectedCuisines = Object.values(onePerCuisine).slice(0, 4);

  selectedCuisines.forEach((recipe) => {
    // Knappen linker til listview med køkkenet valgt, fx ?cuisine=Italian
    kitchenContainer.innerHTML += `
      <article class="kitchen-card">
        <img src="${recipe.image}" alt="${recipe.cuisine}">

        <a href="listview.html?cuisine=${recipe.cuisine}" class="btn-tag cuisine-btn">
          ${recipe.cuisine}
        </a>
      </article>
    `;
  });
}

fetchCuisines();
