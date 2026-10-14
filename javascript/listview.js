const recipeURL = "https://dummyjson.com/recipes";

const listContainer = document.querySelector("#recipeContainer");

function getData(url) {
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      showRecipes(data.recipes);
    });
}

function showRecipes(recipes) {
  listContainer.innerHTML = "";

  recipes.forEach((recipe) => {
    listContainer.innerHTML += `
      <article class="recipe-card">
        <img src="${recipe.image}" alt="${recipe.name}">
        
        <div class="recipe-content">
          <h3>${recipe.name}</h3>
          
          <p>${recipe.cuisine}</p>
          
          <p>Time: ${recipe.prepTimeMinutes + recipe.cookTimeMinutes} min</p>

          <a href="recipe.html?id=${recipe.id}" class="readmore">
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
            class="cuisine-btn"
          >
            ${recipe.cuisine}
          </a>
        </article>
      `;
    });
  });
