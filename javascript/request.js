// Retten kommer med i URL'en fra listview, fx request.html?dish=lasagne
const params = new URLSearchParams(window.location.search);
const dish = params.get("dish");

const requestForm = document.querySelector("#requestForm");
const requestSection = document.querySelector("#requestSection");
const confirmation = document.querySelector("#confirmation");

// Udfyld feltet på forhånd, så man ikke skal skrive retten igen
if (dish) {
  document.querySelector("#dish").value = dish;
}

requestForm.addEventListener("submit", sendRequest);

function sendRequest(event) {
  // Stopper browseren i at genindlæse siden
  event.preventDefault();

  // Der er ingen server, så nummeret gemmes i browseren og tæller op for hvert ønske (starter ved 51)
  let number = Number(localStorage.getItem("requestNumber")) || 50;
  number++;
  localStorage.setItem("requestNumber", number);

  document.querySelector("#requestNumber").textContent = number;
  document.querySelector("#confirmDish").textContent = document.querySelector("#dish").value;

  // Byt formularen ud med bekræftelsen
  requestSection.hidden = true;
  confirmation.hidden = false;
}
