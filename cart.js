const addCartButtons = document.querySelectorAll(".addCart");
const cartCount = document.getElementById("cartCount");
const cartModal = document.getElementById("cartModal");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const viewCart = document.getElementById("viewCart");
const closeCart = document.getElementById("closeCart");

let cart = [];

addCartButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const name = btn.dataset.name;
    const price = parseFloat(btn.dataset.price);
    cart.push({ name, price });
    updateCart();
  });
});

viewCart.addEventListener("click", () => {
  cartModal.classList.remove("hidden");
});

closeCart.addEventListener("click", () => {
  cartModal.classList.add("hidden");
});

function updateCart() {
  cartCount.textContent = cart.length;
  cartItems.innerHTML = "";
  let total = 0;

  cart.forEach(item => {
    total += item.price;
    const li = document.createElement("li");
    li.textContent = `${item.name} - $${item.price}`;
    cartItems.appendChild(li);
  });

  cartTotal.textContent = `Total: $${total}`;
}
