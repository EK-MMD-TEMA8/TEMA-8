/*Jeg bruger addEventListener til at lytte efter 
klik på burger-knappen. Når der klikkes, 
tilføjes eller fjernes klassen active med 
classList.toggle(). 
CSS'en viser derefter menuen, 
når navigationen har klassen active.*/

const burger = document.querySelector(".burger");
const nav = document.querySelector("nav");

function visMenu() {
  burger.classList.toggle("active"); /*→ stregerne bliver til et kryds.*/
  nav.classList.toggle("active");
}

burger.addEventListener("click", visMenu);

const mealTypes = ["breakfast", "lunch", "dinner", "dessert"];

const mealMenu = document.querySelector("#mealMenu");

mealTypes.forEach((mealType) => {
  const li = document.createElement("li");
  const a = document.createElement("a");

  a.href = `/listview?mealType=${mealType}`;
  a.textContent = mealType.charAt(0).toUpperCase() + mealType.slice(1);

  li.append(a);
  mealMenu.append(li);
});
