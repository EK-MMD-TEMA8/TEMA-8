"use strict";

// FORSIDEN
// Hele flowet: hent alle opskrifter fra API'et → lav vibe-knapperne
// → lav inspirationskortene. Alle knapper og kort linker videre til listview.

// ---------------------------------------------------------------
// 1. API-adressen
// ---------------------------------------------------------------
// Adressen, hvor alle opskrifterne ligger. limit=0 = hent dem alle (ellers kun 30)
const recipesUrl = "https://dummyjson.com/recipes?limit=0";

// ---------------------------------------------------------------
// 2. Find kasserne i HTML'en
// querySelector finder et element ud fra dets klasse (.)
// ---------------------------------------------------------------
// Kassen, hvor de små knapper (Italian, Breakfast ...) bliver sat ind
const vibeTags = document.querySelector(".vibe-tags");
// Kassen, hvor de store billedkort bliver sat ind
const kortListe = document.querySelector(".kort-liste");

// ---------------------------------------------------------------
// 3. Start det hele
// ---------------------------------------------------------------
// Funktionerne nedenfor gør ingenting, før de bliver kaldt.
// Denne linje henter opskrifterne og sætter det hele i gang
getData();

// ---------------------------------------------------------------
// 4. Hent data fra API'et
// ---------------------------------------------------------------
function getData() {
  // fetch = "gå ud og hent" data fra adressen
  fetch(recipesUrl)
    // Lav svaret om til noget, JavaScript kan læse
    .then((result) => result.json())
    // Når data er klar, så send det videre til showData (trin 5)
    .then((data) => showData(data));
}

// ---------------------------------------------------------------
// 5. Send opskrifterne videre
// ---------------------------------------------------------------
function showData(data) {
  // Vis data i konsollen (godt til at se, hvad API'et sender)
  console.log("DATA", data);

  // data.recipes = selve listen med opskrifter
  // Lav de små knapper (trin 6)
  showVibeTags(data.recipes);
  // Lav de store kort (trin 7)
  showKort(data.recipes);
}

// ---------------------------------------------------------------
// 6. Vibe-knapperne
// Klikker man på fx "Italian", kommer man til listview.html?cuisine=Italian
// ---------------------------------------------------------------
function showVibeTags(recipes) {
  // Her samler vi al HTML'en, før den sættes ind på siden (tom til at starte med)
  let myInnerHTML = "";

  // En tom liste, som vi fylder med køkkener
  const allCuisines = [];

  // Gå alle opskrifterne igennem én ad gangen
  recipes.forEach((recipe) => {
    // Står opskriftens køkken IKKE allerede på listen...
    if (allCuisines.includes(recipe.cuisine) === false) {
      // ...så tilføj det. På den måde kommer hvert køkken kun med én gang
      allCuisines.push(recipe.cuisine);
    }
  });

  // Tag kun de første 6 køkkener (slice = skær ud)
  const cuisines = allCuisines.slice(0, 6);

  // Lav en knap for hvert køkken
  cuisines.forEach((cuisine) => {
    // += = sæt knappen på efter dem, der allerede er der
    myInnerHTML += `<a href="listview.html?cuisine=${cuisine}" class="btn-tag">${cuisine}</a>`;
  });

  // Måltiderne skriver vi selv, fordi vi vil bestemme rækkefølgen
  const mealTypes = ["Breakfast", "Lunch", "Dinner", "Dessert"];

  // Lav en knap for hvert måltid
  mealTypes.forEach((mealType) => {
    myInnerHTML += `<a href="listview.html?mealType=${mealType}" class="btn-tag">${mealType}</a>`;
  });

  // Sæt alle knapperne ind i kassen på én gang
  vibeTags.innerHTML = myInnerHTML;
}

// ---------------------------------------------------------------
// 7. Inspirationskortene
// Et stort kort med billede for hvert måltid. Klikker man på et kort,
// kommer man til listview med det måltid valgt.
// ---------------------------------------------------------------
function showKort(recipes) {
  // Her samler vi al HTML'en (tom til at starte med)
  let myInnerHTML = "";

  // De måltider, der skal have et kort
  const mealTypes = ["Breakfast", "Lunch", "Dinner", "Dessert", "Snack"];

  // Hvilken opskrift hvert kort skal tage billedet fra:
  // 0 = den første, 1 = den anden osv. Skift tallene for at få andre billeder
  const valgtOpskrift = { Breakfast: 3, Lunch: 3, Dinner: 3, Dessert: 0, Snack: 1 };

  // Lav et kort for hvert måltid
  mealTypes.forEach((mealType) => {
    // En tom liste, som vi fylder med opskrifter, der har dette måltid
    const matches = [];

    // Gå alle opskrifterne igennem
    recipes.forEach((recipe) => {
      // Står måltidet i opskriftens liste, fx ["Lunch", "Dinner"]...
      if (recipe.mealType.includes(mealType)) {
        // ...så kommer den med
        matches.push(recipe);
      }
    });

    // Find nummeret for dette måltid, fx Snack → 1
    const nummer = valgtOpskrift[mealType];
    // Tag den opskrift på listen, som har det nummer
    const recipe = matches[nummer];

    // Lav kortet: sværhedsgrad, billede og navnet på måltidet
    myInnerHTML += `<a href="listview.html?mealType=${mealType}" class="kort">
                <p class="badge">${recipe.difficulty}</p>
                <img src="${recipe.image}" alt="${mealType}" class="kort-billede">
                <h3 class="kort-titel">${mealType}</h3>
            </a>`;
  });

  // Sæt alle kortene ind i kassen på én gang
  kortListe.innerHTML = myInnerHTML;
}
