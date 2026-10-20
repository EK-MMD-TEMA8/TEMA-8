// Recipe Fetch + read id from url

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

// Find the elements in the HTML, Title, Facts, Image, Ingredient List, Instruction List, Recipe Body
const title = document.querySelector("#recipeTitle");
const facts = document.querySelector("#recipeFacts");
const image = document.querySelector("#recipeImage");
const ingredientList = document.querySelector("#ingredientList");
const instructionList = document.querySelector("#instructionList");
const recipeBody = document.querySelector("#recipeBody");

// function to fetch recipe from API, or show error if not found
function getRecipe() {
  if (!id) {
    showError("No recipe chosen");
    return;
  }

  // Fetch recipe from the API
  fetch(`https://dummyjson.com/recipes/${id}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(response.status);
      }
      return response.json();
    })
    .then((recipe) => {
      showRecipe(recipe);
    })
    .catch(() => {
      showError("We couldn't find that recipe");
    });
}

// function that builds the recipe page from the API data
function showRecipe(recipe) {
  document.title = `${recipe.name} | Yum`;
  title.textContent = recipe.name;

  // Show the recipe picture and name, and the facts: difficulty, prep time, cook time, servings, cuisine
  image.src = recipe.image;
  image.alt = recipe.name;

  facts.innerHTML = `
    <dt>Prep</dt><dd>${recipe.prepTimeMinutes} min</dd>
    <dt>Cook</dt><dd>${recipe.cookTimeMinutes} min</dd>
    <dt>Servings</dt><dd>${recipe.servings}</dd>
    <dt>Difficulty</dt><dd>${recipe.difficulty}</dd>
    <dt>Cuisine</dt><dd>${recipe.cuisine}</dd>
  `;
  // Show the ingredients and instructions as lists
  ingredientList.innerHTML = recipe.ingredients.map((ingredient) => `<li>${ingredient}</li>`).join("");

  instructionList.innerHTML = recipe.instructions.map((step) => `<li>${step}</li>`).join("");
}

// function to show an error message if the recipe is not found
function showError(message) {
  title.textContent = message;
  image.hidden = true;
  recipeBody.hidden = true;
}

// Call the function to fetch the recipe when the page loads
getRecipe();

// Discount Dialog
const discountButton = document.querySelector("#discountButton");
const discountDialog = document.querySelector("#discountDialog");
const dialogClose = document.querySelector("#dialogClose");
const signupForm = document.querySelector("#signupForm");
const discountForm = document.querySelector("#discountForm");
const discountThanks = document.querySelector("#discountThanks");

discountButton.addEventListener("click", () => {
  discountDialog.showModal();
});

dialogClose.addEventListener("click", () => {
  discountDialog.close();
});

discountDialog.addEventListener("click", (event) => {
  if (event.target === discountDialog) {
    discountDialog.close();
  }
});

// When the signup form is submitted, hide the form and show the thank you message
signupForm.addEventListener("submit", (event) => {
  event.preventDefault();
  discountForm.hidden = true;
  discountThanks.hidden = false;
});
