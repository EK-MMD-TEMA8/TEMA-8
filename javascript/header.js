const mealTypes = ["Breakfast", "Lunch", "Dinner", "Dessert"];

const mealMenu = document.querySelector("#mealMenu");

mealTypes.forEach((mealType) => {
  const li = document.createElement("li");
  const a = document.createElement("a");

  a.href = `listview.html?mealType=${mealType}`;
  a.textContent = mealType;

  li.append(a);
  mealMenu.append(li);
});
