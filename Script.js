"use strict";

const API_URL = "https://fakestoreapi.com/products";
const CART_KEY = "pier-parcel-cart";

// Used only if the API cannot be reached (offline, blocked, rate-limited).
const FALLBACK = [
  { id: 1, title: "Fjallraven Foldsack No. 1 Backpack, Fits 15 Laptops", price: 109.95, category: "men's clothing", image: "", rating: { rate: 3.9, count: 120 } },
  { id: 2, title: "Mens Casual Premium Slim Fit T-Shirts", price: 22.3, category: "men's clothing", image: "", rating: { rate: 4.1, count: 259 } },
  { id: 5, title: "John Hardy Women's Legends Naga Gold & Silver Dragon Station Chain Bracelet", price: 695, category: "jewelery", image: "", rating: { rate: 4.6, count: 400 } },
  { id: 9, title: "WD 2TB Elements Portable External Hard Drive - USB 3.0", price: 64, category: "electronics", image: "", rating: { rate: 3.3, count: 203 } },
  { id: 15, title: "BIYLACLESEN Women's 3-in-1 Snowboard Jacket Winter Coats", price: 56.99, category: "women's clothing", image: "", rating: { rate: 2.6, count: 235 } },
  { id: 20, title: "DANVOUY Womens T Shirt Casual Cotton Short", price: 12.99, category: "women's clothing", image: "", rating: { rate: 3.6, count: 145 } }
];

const $ = (id) => document.getElementById(id);
const money = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

const state = {
  products: [],
  category: "all",
  query: "",
  sort: "default",
  cart: loadCart()
};

function loadCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || {}; }
  catch { return {}; }
}
function saveCart() {
  try { localStorage.setItem(CART_KEY, JSON.stringify(state.cart)); } catch {}
}

async function init() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("HTTP " + res.status);
    state.products = await res.json();
    $("status").textContent = "";
  } catch (err) {
    console.warn("API unavailable, using fallback data:", err);
    state.products = FALLBACK;
    $("status").textContent = "Live data is unavailable, showing a small offline selection.";
  }
  buildFilters();
  render();
  renderCart();
}

function buildFilters() {
  const cats = ["all", ...new Set(state.products.map((p) => p.category))];
  $("filters").innerHTML = "";
  cats.forEach((c) => {
    const b = document.createElement("button");
    b.textContent = c;
    b.setAttribute("aria-pressed", c === state.category);
    b.addEventListener("click", () => {
      state.category = c;
      [...$("filters").children].forEach((x) => x.setAttribute("aria-pressed", x === b));
      render();
    });
    $("filters").appendChild(b);
  });
}

function visibleProducts() {
  const q = state.query.trim().toLowerCase();
  let list = state.products.filter((p) =>
    (state.category === "all" || p.category === state.category) &&
    (!q || p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
  );
  if (state.sort === "low") list.sort((a, b) => a.price - b.price);
  if (state.sort === "high") list.sort((a, b) => b.price - a.price);
  if (state.sort === "rating") list.sort((a, b) => b.rating.rate - a.rating.rate);
  return list;
}

function thumb(p) {
  return p.image
    ? `<img src="${p.image}" alt="${esc(p.title)}" loading="lazy" onerror="this.outerHTML='<span class=ph>${esc(p.title[0])}</span>'">`
    : `<span class="ph">${esc(p.title[0])}</span>`;
}
function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function render() {
  const list = visibleProducts();
  $("grid").innerHTML = list.map((p) => `
    <article class="card">
      <div class="thumb">${thumb(p)}</div>
      <div class="info">
        <p class="cat">${esc(p.category)}</p>
        <h3 class="title">${esc(p.title)}</h3>
        <span class="rating">${p.rating.rate.toFixed(1)} / 5 (${p.rating.count} reviews)</span>
        <div class="buy">
          <span class="price">${money(p.price)}</span>
          <button class="add" data-id="${p.id}">Add to cart</button>
        </div>
      </div>
    </article>`).join("");
  if (!list.length) $("status").textContent = "No products match your search. Try a different word or category.";
  else if ($("status").textContent.startsWith("No products")) $("status").textContent = "";
}

function renderCart() {
  const ids = Object.keys(state.cart);
  const items = ids.map((id) => ({ p: state.products.find((x) => x.id == id), q: state.cart[id] })).filter((x) => x.p);
  const count = items.reduce((s, x) => s + x.q, 0);
  const total = items.reduce((s, x) => s + x.q * x.p.price, 0);
  $("cartCount").textContent = count;
  $("total").textContent = money(total);
  $("checkout").disabled = !count;
  $("cartItems").innerHTML = items.length
    ? items.map(({ p, q }) => `
      <li>
        <img src="${p.image}" alt="" onerror="this.style.visibility='hidden'">
        <div><div class="n">${esc(p.title)}</div>
          <div class="qty">
            <button data-dec="${p.id}" aria-label="Remove one">-</button>
            <span>${q}</span>
            <button data-inc="${p.id}" aria-label="Add one">+</button>
          </div></div>
        <strong>${money(p.price * q)}</strong>
      </li>`).join("")
    : `<li class="empty">Your cart is empty. Add something from the catalogue.</li>`;
}

function change(id, delta) {
  state.cart[id] = (state.cart[id] || 0) + delta;
  if (state.cart[id] <= 0) delete state.cart[id];
  saveCart();
  renderCart();
}

function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast.t);
  toast.t = setTimeout(() => t.classList.remove("show"), 2200);
}

function toggleCart(open) {
  $("drawer").classList.toggle("open", open);
  $("drawer").setAttribute("aria-hidden", !open);
  $("overlay").hidden = !open;
}

// Events
$("grid").addEventListener("click", (e) => {
  const b = e.target.closest(".add");
  if (!b) return;
  change(b.dataset.id, 1);
  toast("Added to cart");
});
$("cartItems").addEventListener("click", (e) => {
  const inc = e.target.closest("[data-inc]"), dec = e.target.closest("[data-dec]");
  if (inc) change(inc.dataset.inc, 1);
  if (dec) change(dec.dataset.dec, -1);
});
$("search").addEventListener("input", (e) => { state.query = e.target.value; render(); });
$("sort").addEventListener("change", (e) => { state.sort = e.target.value; render(); });
$("cartBtn").addEventListener("click", () => toggleCart(true));
$("closeCart").addEventListener("click", () => toggleCart(false));
$("overlay").addEventListener("click", () => toggleCart(false));
document.addEventListener("keydown", (e) => { if (e.key === "Escape") toggleCart(false); });
$("clear").addEventListener("click", () => { state.cart = {}; saveCart(); renderCart(); });
$("checkout").addEventListener("click", () => {
  state.cart = {}; saveCart(); renderCart(); toggleCart(false);
  toast("Demo order placed. No payment was taken.");
});

init();
