"use strict";

// FORSIDEN
// Henter alle opskrifter og laver vibe-knapperne og inspirationskortene.
// Knapper og kort linker til listview.

// ---------------------------------------------------------------
// 1. API-adresse
// ---------------------------------------------------------------
// limit=0 henter alle opskrifter (standard er 30)
const recipesUrl = "https://dummyjson.com/recipes?limit=0";

// ---------------------------------------------------------------
// 2. Elementer fra HTML'en
// ---------------------------------------------------------------
// Container til de små knapper (Italian, Breakfast ...)
const vibeTags = document.querySelector(".vibe-tags");
// Container til de store billedkort
const kortListe = document.querySelector(".kort-liste");

// ---------------------------------------------------------------
// 3. Start
// ---------------------------------------------------------------
// Henter opskrifterne og starter siden
getData();

// ---------------------------------------------------------------
// 4. Hent data fra API'et
// ---------------------------------------------------------------
function getData() {
  // Hent data fra adressen
  fetch(recipesUrl)
    // Lav svaret om til JavaScript-data
    .then((result) => result.json())
    // Send data videre til showData (trin 5)
    .then((data) => showData(data));
}

// ---------------------------------------------------------------
// 5. Fordel opskrifterne
// ---------------------------------------------------------------
function showData(data) {
  // Vis data i konsollen
  console.log("DATA", data);

  // data.recipes = listen med opskrifter
  // Små knapper (trin 6)
  showVibeTags(data.recipes);
  // Store kort (trin 7)
  showKort(data.recipes);
}

// ---------------------------------------------------------------
// 6. Vibe-knapper
// Fx "Italian" linker til listview.html?cuisine=Italian
// ---------------------------------------------------------------
function showVibeTags(recipes) {
  // Samler HTML'en, før den sættes ind
  let myInnerHTML = "";

  // Liste med hvert køkken én gang
  const allCuisines = [];

  // Gennemgå alle opskrifter
  recipes.forEach((recipe) => {
    // Tilføj køkkenet, hvis det ikke allerede er på listen
    if (allCuisines.includes(recipe.cuisine) === false) {
      allCuisines.push(recipe.cuisine);
    }
  });

  // De første 6 køkkener
  const cuisines = allCuisines.slice(0, 6);

  // Én knap pr. køkken
  cuisines.forEach((cuisine) => {
    myInnerHTML += `<a href="listview.html?cuisine=${cuisine}" class="btn-tag">${cuisine}</a>`;
  });

  // Måltiderne står i fast rækkefølge
  const mealTypes = ["Breakfast", "Lunch", "Dinner", "Dessert"];

  // Én knap pr. måltid
  mealTypes.forEach((mealType) => {
    myInnerHTML += `<a href="listview.html?mealType=${mealType}" class="btn-tag">${mealType}</a>`;
  });

  // Indsæt alle knapperne
  vibeTags.innerHTML = myInnerHTML;
}

// ---------------------------------------------------------------
// 7. Inspirationskort
// Ét kort med billede pr. måltid. Linker til listview med måltidet valgt.
// ---------------------------------------------------------------
function showKort(recipes) {
  // Samler HTML'en, før den sættes ind
  let myInnerHTML = "";

  // Måltider, der får et kort
  const mealTypes = ["Breakfast", "Lunch", "Dinner", "Dessert", "Snack"];

  // Hvilken opskrift hvert kort tager billedet fra (0 = første, 1 = anden ...)
  const valgtOpskrift = { Breakfast: 3, Lunch: 3, Dinner: 3, Dessert: 0, Snack: 1 };

  // Ét kort pr. måltid
  mealTypes.forEach((mealType) => {
    // Opskrifter med dette måltid
    const matches = [];

    recipes.forEach((recipe) => {
      // Måltidet står i opskriftens liste, fx ["Lunch", "Dinner"]
      if (recipe.mealType.includes(mealType)) {
        matches.push(recipe);
      }
    });

    // Nummeret for måltidet, fx Snack → 1
    const nummer = valgtOpskrift[mealType];
    // Opskriften med det nummer
    const recipe = matches[nummer];

    // Kortet: sværhedsgrad, billede og måltidets navn
    myInnerHTML += `<a href="listview.html?mealType=${mealType}" class="kort">
                <p class="badge">${recipe.difficulty}</p>
                <img src="${recipe.image}" alt="${mealType}" class="kort-billede">
                <h3 class="kort-titel">${mealType}</h3>
            </a>`;
  });

  // Indsæt alle kortene
  kortListe.innerHTML = myInnerHTML;
}
