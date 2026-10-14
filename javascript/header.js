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
