// HEADER (bruges på alle sider)
// Bygger menupunkterne Breakfast, Lunch, Dinner og Dessert i headeren.
// Hvert punkt linker til listview med måltidet valgt, fx listview.html?mealType=Breakfast

// ---------------------------------------------------------------
// 1. Måltiderne i menuen
// ---------------------------------------------------------------
// Vi skriver dem selv i stedet for at hente dem fra API'et,
// fordi vi vil bestemme rækkefølgen, og fordi menuen skal virke med det samme
const mealTypes = ["Breakfast", "Lunch", "Dinner", "Dessert"];

// ---------------------------------------------------------------
// 2. Find listen i HTML'en, hvor menupunkterne skal sættes ind
// ---------------------------------------------------------------
const mealMenu = document.querySelector("#mealMenu");

// ---------------------------------------------------------------
// 3. Lav et menupunkt for hvert måltid
// ---------------------------------------------------------------
mealTypes.forEach((mealType) => {
  // Lav et nyt listepunkt (<li>) og et nyt link (<a>)
  const li = document.createElement("li");
  const a = document.createElement("a");

  // Linket sender måltidet videre til listview i URL'en
  a.href = `listview.html?mealType=${mealType}`;
  // Teksten, brugeren ser, fx "Breakfast"
  a.textContent = mealType;

  // Sæt linket ind i listepunktet, og listepunktet ind i menuen
  li.append(a);
  mealMenu.append(li);
});
