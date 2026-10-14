"use strict";

// TRIN 1: API-ADRESSEN
// limit=0 = hent alle opskrifter, ikke kun de første 30
const recipesUrl = "https://dummyjson.com/recipes?limit=0";

// TRIN 2: FIND KASSERNE I HTML'EN
const vibeTags = document.querySelector(".vibe-tags");
const kortListe = document.querySelector(".kort-liste");

// TRIN 6: START DET HELE
getData();

// TRIN 3: HENT DATA FRA API'ET
function getData() {
  fetch(recipesUrl).then((result) => result.json().then((data) => showData(data)));
}

// TRIN 4: SEND OPSKRIFTERNE VIDERE
// data.recipes = selve listen med opskrifter
function showData(data) {
  console.log("DATA", data);

  showVibeTags(data.recipes);
  showKort(data.recipes);
}

// VIBE-KNAPPERNE
function showVibeTags(recipes) {
  let myInnerHTML = "";

  // map = lav en ny liste med kun køkkenet fra hver opskrift, fx "Italian"
  // new Set = fjern dubletter, så "Italian" kun kommer med én gang
  // slice(0, 6) = tag kun de første 6
  const cuisines = [...new Set(recipes.map((recipe) => recipe.cuisine))].slice(0, 6);

  cuisines.forEach((cuisine) => {
    myInnerHTML += `<a href="listview.html?cuisine=${cuisine}" class="btn-tag">${cuisine}</a>`;
  });

  // Måltiderne skriver vi selv, fordi vi vil bestemme rækkefølgen
  const mealTypes = ["Breakfast", "Lunch", "Dinner", "Dessert"];

  mealTypes.forEach((mealType) => {
    myInnerHTML += `<a href="listview.html?mealType=${mealType}" class="btn-tag">${mealType}</a>`;
  });

  vibeTags.innerHTML = myInnerHTML;
}

// TRIN 5B: INSPIRATIONSKORTENE
function showKort(recipes) {
  let myInnerHTML = "";

  const mealTypes = ["Breakfast", "Lunch", "Dinner", "Dessert", "Snack"];

  // Hvilken opskrift hvert måltid skal bruge: 0 = den første, 1 = den anden osv.
  // Skift tallene for at få andre billeder
  const valgtOpskrift = { Breakfast: 3, Lunch: 3, Dinner: 3, Dessert: 0, Snack: 1 };

  mealTypes.forEach((mealType) => {
    // filter = lav en ny liste med kun de opskrifter, der har dette måltid
    // includes = tjekker om mealType står i opskriftens liste, fx ["Lunch", "Dinner"]
    const matches = recipes.filter((recipe) => recipe.mealType.includes(mealType));

    // valgtOpskrift[mealType] = slå tallet op for dette måltid, fx Snack → 1
    const recipe = matches[valgtOpskrift[mealType]];

    myInnerHTML += `<a href="listview.html?mealType=${mealType}" class="kort">
                <p class="badge">${recipe.difficulty}</p>
                <img src="${recipe.image}" alt="${mealType}" class="kort-billede">
                <h3 class="kort-titel">${mealType}</h3>
            </a>`;
  });

  kortListe.innerHTML = myInnerHTML;
}
