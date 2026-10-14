// const recipeURL = "https://dummyjson.com/recipes";
// limit=0 = hent alle opskrifter, ikke kun de første 30
const recipeURL = "https://dummyjson.com/recipes?limit=0";

const listContainer = document.querySelector("#recipeContainer");
const listTitle = document.querySelector("#listTitle");
const filterSection = document.querySelector(".filter-section");
const cuisineButtons = document.querySelector("#cuisineButtons");
const backButton = document.querySelector("#backButton");
const moreButton = document.querySelector(".more-btn");

// Her gemmer vi alle opskrifterne, så vi kan filtrere uden at hente dem igen
let allRecipes = [];

// "See more": vi viser 12 opskrifter ad gangen
const perPage = 12;
let shown = perPage;
// De opskrifter, der passer til filtrene lige nu
let currentRecipes = [];

// Hvor mange gange man har klikket på et filter, siden man kom ind på siden
// Er det 0, er der ikke noget at gå tilbage til, og så skjuler vi tilbage-knappen
// history.state er der, hvis man kommer tilbage fra en opskrift
let clicks = history.state ? history.state.clicks : 0;

const filters = {};
readFiltersFromURL();

// Kommer man ind med et filter, fx fra Breakfast i headeren, lægger vi en "ALL" ind før det i historikken
// Så ender tilbage-knappen altid på ALL
// (history.state er tom, når man lige er kommet ind på siden)
if (!history.state && window.location.search !== "") {
  const filteredURL = window.location.search;

  // replaceState = lav det nuværende punkt om til ALL, pushState = læg filteret ovenpå
  history.replaceState({ clicks: 0 }, "", window.location.pathname);
  history.pushState({ clicks: 1 }, "", filteredURL);
  clicks = 1;
}

// Læs filtrene fra URL'en, fx listview.html?mealType=Breakfast
// Står der ikke noget i URL'en, bruger vi "All"
function readFiltersFromURL() {
  const params = new URLSearchParams(window.location.search);

  filters.mealType = params.get("mealType") || "All";
  filters.cuisine = params.get("cuisine") || "All";
  filters.time = params.get("time") || "All";
}

// Skriv filtrene ind i URL'en, så browserens tilbage-knap husker dem
function saveFiltersInURL() {
  const params = new URLSearchParams();

  // Vi tager kun de filtre med, der ikke er "All"
  Object.keys(filters).forEach((key) => {
    if (filters[key] !== "All") {
      params.set(key, filters[key]);
    }
  });

  clicks++;
  // pushState = lav et nyt punkt i historikken uden at hente siden igen
  history.pushState({ clicks: clicks }, "", `?${params}`);
}

function getData(url) {
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      // showRecipes(data.recipes);
      allRecipes = data.recipes;
      showCuisineButtons();
      filterRecipes();
    });
}

// Nogle knapper dækker flere køkkener i API'et
const cuisineGroups = {
  Asian: ["Asian", "Japanese", "Thai", "Korean", "Vietnamese", "Indian", "Pakistani"],
};

// Lav en knap for hvert køkken i API'et
function showCuisineButtons() {
  // map = tag køkkenet fra hver opskrift, new Set = fjern dubletter, sort = sorter alfabetisk
  const cuisines = [...new Set(allRecipes.map((recipe) => recipe.cuisine))].sort();

  cuisines.forEach((cuisine, index) => {
    // "Asian" er gruppen med alle de asiatiske køkkener, så den hedder ASIA på knappen
    const label = cuisine === "Asian" ? "ASIA" : cuisine.toUpperCase();

    // De første 6 køkkener vises altid. Resten får klassen "extra" og er skjult, til man klikker "See more"
    const extra = index >= cuisinesShown ? "extra" : "";

    cuisineButtons.innerHTML += `<button class="btn-tag ${extra}" data-filter="cuisine" data-value="${cuisine}">${label}</button>`;
  });

  // Er der valgt et skjult køkken (fx Thai fra forsiden), viser vi dem alle med det samme
  const chosenButton = cuisineButtons.querySelector(`[data-value="${filters.cuisine}"]`);
  if (chosenButton && chosenButton.classList.contains("extra")) {
    toggleCuisines();
  }
}

// Hvor mange køkkener der vises, før man klikker "See more"
const cuisinesShown = 6;
const cuisineMore = document.querySelector("#cuisineMore");

// Vis eller skjul de ekstra køkkener
function toggleCuisines() {
  cuisineButtons.classList.toggle("show-all");

  if (cuisineButtons.classList.contains("show-all")) {
    cuisineMore.textContent = "See less";
  } else {
    cuisineMore.textContent = "See more";
  }
}

cuisineMore.addEventListener("click", toggleCuisines);

// Når man klikker på en knap, gemmer vi valget og filtrerer igen
// Vi lytter på hele sektionen, så det også virker for køkkenknapperne, der bliver lavet senere
filterSection.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  // Kun filterknapperne har data-filter, så tilbage-knappen bliver sprunget over her
  if (!button || !button.dataset.filter) return;

  // Klikker man på den knap, der allerede er valgt, sker der ingenting
  if (filters[button.dataset.filter] === button.dataset.value) return;

  filters[button.dataset.filter] = button.dataset.value;
  saveFiltersInURL();
  filterRecipes();
});

// Tilbage-knappen gør det samme som browserens tilbage-pil
backButton.addEventListener("click", () => {
  history.back();
});

// popstate sker, når man går tilbage (eller frem) i historikken
// Så læser vi filtrene fra URL'en igen og viser de rigtige opskrifter
window.addEventListener("popstate", (event) => {
  clicks = event.state ? event.state.clicks : 0;
  readFiltersFromURL();
  filterRecipes();
});

function filterRecipes() {
  // Er den valgte knap en gruppe, bruger vi listen. Ellers bare det ene køkken
  const cuisineList = cuisineGroups[filters.cuisine] || [filters.cuisine];

  const filtered = allRecipes.filter((recipe) => {
    const time = recipe.prepTimeMinutes + recipe.cookTimeMinutes;

    // startsWith, fordi API'et både bruger "Snack" og "Snacks"
    const mealOk = filters.mealType === "All" || recipe.mealType.some((type) => type.startsWith(filters.mealType));
    const cuisineOk = filters.cuisine === "All" || cuisineList.includes(recipe.cuisine);
    const timeOk = filters.time === "All" || (filters.time === "Under" && time < 30) || (filters.time === "Over" && time >= 30);

    return mealOk && cuisineOk && timeOk;
  });

  // Nye filtre = start forfra med de første 12
  currentRecipes = filtered;
  shown = perPage;

  showActiveButtons();
  showTitle();
  showRecipes();

  // Vis kun tilbage-knappen, når der er et tidligere filter at gå tilbage til
  backButton.hidden = clicks === 0;
}

// Giv den valgte knap i hver gruppe klassen "active"
function showActiveButtons() {
  document.querySelectorAll(".filter-buttons button").forEach((button) => {
    const isActive = filters[button.dataset.filter] === button.dataset.value;
    button.classList.toggle("active", isActive);
  });
}

// Skriv hvad der er valgt i overskriften, fx "BREAKFAST RECIPES"
function showTitle() {
  const chosen = [filters.cuisine, filters.mealType].filter((value) => value !== "All");

  if (chosen.length === 0) {
    listTitle.textContent = "ALL RECIPES";
  } else {
    listTitle.textContent = `${chosen.join(" ")} RECIPES`.toUpperCase();
  }
}

// "See more" viser 12 opskrifter mere
moreButton.addEventListener("click", () => {
  shown += perPage;
  showRecipes();
});

// function showRecipes(recipes) {
function showRecipes() {
  listContainer.innerHTML = "";

  // slice = tag kun de første opskrifter, fx 0-12, så 0-24 osv.
  const recipes = currentRecipes.slice(0, shown);

  // Skjul "See more", når alle opskrifterne er vist
  moreButton.hidden = shown >= currentRecipes.length;

  if (recipes.length === 0) {
    listContainer.innerHTML = "<p>No recipes match your choice.</p>";
    return;
  }

  recipes.forEach((recipe) => {
    // <a href="recipe.html?id=${recipe.id}" class="readmore">
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

getData(recipeURL);

const kitchenContainer = document.querySelector("#kitchenContainer");

fetch("https://dummyjson.com/recipes")
  .then((response) => response.json())
  .then((data) => {
    // Find unikke cuisines
    const cuisines = [...new Map(data.recipes.map((recipe) => [recipe.cuisine, recipe])).values()];

    // Tag de første 4 forskellige cuisines
    const selectedCuisines = cuisines.slice(0, 4);

    selectedCuisines.forEach((recipe) => {
      // class="cuisine-btn"
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
