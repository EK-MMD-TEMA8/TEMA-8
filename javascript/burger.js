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
