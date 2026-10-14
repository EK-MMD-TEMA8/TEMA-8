// limit=0 = hent alle opskrifter, ikke kun de første 30
const recipeURL = "https://dummyjson.com/recipes?limit=0";

const listContainer = document.querySelector("#recipeContainer");
const listTitle = document.querySelector("#listTitle");
const filterSection = document.querySelector(".filter-section");
const cuisineButtons = document.querySelector("#cuisineButtons");

// Her gemmer vi alle opskrifterne, så vi kan filtrere uden at hente dem igen
let allRecipes = [];

// Læs filtrene fra URL'en, fx listview.html?mealType=Breakfast
// Står der ikke noget i URL'en, bruger vi "All"
const params = new URLSearchParams(window.location.search);

const filters = {
  mealType: params.get("mealType") || "All",
  cuisine: params.get("cuisine") || "All",
  time: "All",
};

function getData(url) {
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
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

  cuisines.forEach((cuisine) => {
    // "Asian" er gruppen med alle de asiatiske køkkener, så den hedder ASIA på knappen
    const label = cuisine === "Asian" ? "ASIA" : cuisine.toUpperCase();
    cuisineButtons.innerHTML += `<button class="btn-tag" data-filter="cuisine" data-value="${cuisine}">${label}</button>`;
  });
}

// Når man klikker på en knap, gemmer vi valget og filtrerer igen
// Vi lytter på hele sektionen, så det også virker for køkkenknapperne, der bliver lavet senere
filterSection.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  filters[button.dataset.filter] = button.dataset.value;
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

  showActiveButtons();
  showTitle();
  showRecipes(filtered);
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

function showRecipes(recipes) {
  listContainer.innerHTML = "";

  if (recipes.length === 0) {
    listContainer.innerHTML = "<p>No recipes match your choice.</p>";
    return;
  }

  recipes.forEach((recipe) => {
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
