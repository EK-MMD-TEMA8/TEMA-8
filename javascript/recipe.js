const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const title = document.querySelector("#recipeTitle");
const facts = document.querySelector("#recipeFacts");
const image = document.querySelector("#recipeImage");
const ingredientList = document.querySelector("#ingredientList");
const instructionList = document.querySelector("#instructionList");
const recipeBody = document.querySelector("#recipeBody");

function getRecipe() {
  if (!id) {
    showError("No recipe chosen");
    return;
  }

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

function showRecipe(recipe) {
  document.title = `${recipe.name} | Yum`;
  title.textContent = recipe.name;

  image.src = recipe.image;
  image.alt = recipe.name;

  facts.innerHTML = `
    <dt>Prep</dt><dd>${recipe.prepTimeMinutes} min</dd>
    <dt>Cook</dt><dd>${recipe.cookTimeMinutes} min</dd>
    <dt>Servings</dt><dd>${recipe.servings}</dd>
    <dt>Difficulty</dt><dd>${recipe.difficulty}</dd>
    <dt>Cuisine</dt><dd>${recipe.cuisine}</dd>
  `;

  ingredientList.innerHTML = recipe.ingredients.map((ingredient) => `<li>${ingredient}</li>`).join("");

  instructionList.innerHTML = recipe.instructions.map((step) => `<li>${step}</li>`).join("");
}

function showError(message) {
  title.textContent = message;
  image.hidden = true;
  recipeBody.hidden = true;
}

getRecipe();

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

signupForm.addEventListener("submit", (event) => {
  event.preventDefault();
  discountForm.hidden = true;
  discountThanks.hidden = false;
});
