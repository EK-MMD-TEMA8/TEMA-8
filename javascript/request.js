// REQUEST-SIDEN
// Man kommer hertil fra "Request it →" på listview, fx request.html?dish=lasagne
// Hele flowet: læs retten fra URL'en → skriv den i feltet → brugeren klikker send
// → lav et nummer → vis "Request #51 received"

// ---------------------------------------------------------------
// 1. Hent retten fra URL'en
// ---------------------------------------------------------------
// Læs alt efter ? i adressen, fx ?dish=lasagne
const params = new URLSearchParams(window.location.search);
// Find det, der står efter "dish=", fx "lasagne". Står der ikke noget, får vi null
const dish = params.get("dish");

// ---------------------------------------------------------------
// 2. Find de elementer i HTML'en, vi skal bruge
// querySelector finder et element ud fra dets id (#)
// ---------------------------------------------------------------
// Selve formularen
const requestForm = document.querySelector("#requestForm");
// Sektionen med formularen
const requestSection = document.querySelector("#requestSection");
// "Thank you!"-sektionen (den er skjult til at starte med)
const confirmation = document.querySelector("#confirmation");
// Feltet "Which dish?"
const dishInput = document.querySelector("#dish");

// ---------------------------------------------------------------
// 3. Skriv retten ind i feltet
// ---------------------------------------------------------------
// Står der en ret i URL'en (dish er ikke null)...
if (dish !== null) {
  // ...så skriv den ind i feltet, så brugeren ikke skal skrive den igen
  dishInput.value = dish;
}
// Står der ingen ret, sker der ingenting – feltet er bare tomt

// ---------------------------------------------------------------
// 4. Lyt efter, når formularen sendes
// ---------------------------------------------------------------
// Når man klikker "Send request" (eller trykker Enter), så kør sendRequest
requestForm.addEventListener("submit", sendRequest);

function sendRequest(event) {
  // ---------------------------------------------------------------
  // 5. Stop siden i at genindlæse
  // ---------------------------------------------------------------
  // Normalt genindlæser browseren siden, når en formular sendes.
  // Det stopper vi, så vi selv kan vise "Thank you!"
  event.preventDefault();

  // ---------------------------------------------------------------
  // 6. Lav ønske-nummeret
  // localStorage er en lille "notesblok" i browseren, som husker ting,
  // selvom man lukker siden
  // ---------------------------------------------------------------
  // Start på 50, hvis der ikke er gemt noget endnu
  let number = 50;

  // Hent det nummer, vi gemte sidst (null, hvis der ikke er noget)
  const savedNumber = localStorage.getItem("requestNumber");
  // Er der gemt et nummer...
  if (savedNumber !== null) {
    // ...så brug det. Number laver teksten "51" om til tallet 51
    number = Number(savedNumber);
  }

  // Læg 1 til, så det første ønske bliver 51
  number = number + 1;
  // Gem det nye nummer, så næste ønske bliver 52
  localStorage.setItem("requestNumber", number);

  // ---------------------------------------------------------------
  // 7. Skriv nummer og ret ind i bekræftelsen
  // I HTML'en står der: Request #<span id="requestNumber"></span> received
  // ---------------------------------------------------------------
  // Put nummeret ind i det tomme <span>, så der står "Request #51 received"
  document.querySelector("#requestNumber").textContent = number;
  // Put retten fra feltet ind i teksten "We'll let you know when ... is ready"
  document.querySelector("#confirmDish").textContent = dishInput.value;

  // ---------------------------------------------------------------
  // 8. Byt formularen ud med "Thank you!"
  // Det er bare et bytte: man skifter ikke side, den ene kasse forsvinder
  // og den anden kommer frem, så brugeren kan se, at ønsket er modtaget.
  // OBS: det har intet med opskrifterne at gøre. Om en ret findes eller ej,
  // bliver bestemt i listview.js, før man overhovedet kommer herind.
  // ---------------------------------------------------------------
  // Skjul formularen (hidden = true → skjult)
  requestSection.hidden = true;
  // Vis "Thank you!" (hidden = false → vises)
  confirmation.hidden = false;
}
