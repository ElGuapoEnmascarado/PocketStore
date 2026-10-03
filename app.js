const API_URL = "https://fakestoreapi.com/products?limit=12";
const FALLBACK_URL = "./data/products.json";

const productList = document.querySelector("#productList");
const message = document.querySelector("#message");
const productCount = document.querySelector("#productCount");
const connectionStatus = document.querySelector("#connectionStatus");
const reloadButton = document.querySelector("#reloadButton");

document.addEventListener("DOMContentLoaded", () => {
  updateConnectionStatus();
  loadProducts();
  registerServiceWorker();
});

window.addEventListener("online", () => {
  updateConnectionStatus();
  loadProducts();
});

window.addEventListener("offline", updateConnectionStatus);

reloadButton.addEventListener("click", loadProducts);

function updateConnectionStatus() {
  const online = navigator.onLine;

  connectionStatus.textContent = online ? "● En línea" : "● Sin conexión";
  connectionStatus.classList.toggle("online", online);
  connectionStatus.classList.toggle("offline", !online);
}

async function loadProducts() {
  showMessage("Cargando catálogo...");

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const products = await response.json();
    renderProducts(products);
    hideMessage();
  } catch (error) {
    console.warn("No fue posible consultar la API. Usando catálogo local.", error);

    try {
      const fallbackResponse = await fetch(FALLBACK_URL);

      if (!fallbackResponse.ok) {
        throw new Error("No se pudo cargar el catálogo local.");
      }

      const fallbackProducts = await fallbackResponse.json();
      renderProducts(fallbackProducts);

      showMessage(
        "Estás viendo el catálogo disponible sin conexión o de respaldo."
      );
    } catch (fallbackError) {
      console.error(fallbackError);
      showMessage(
        "No fue posible cargar el catálogo. Verifica que la aplicación se ejecute desde localhost o HTTPS."
      );
    }
  }
}

function renderProducts(products) {
  productList.innerHTML = "";

  products.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";

    const imageContent = product.image
      ? `<img
          class="product-image"
          src="${escapeHTML(product.image)}"
          alt="${escapeHTML(product.title)}"
          loading="lazy"
        />`
      : `<div class="product-placeholder" aria-hidden="true">${getCategoryEmoji(product.category)}</div>`;

    card.innerHTML = `
      <div class="product-image-wrap">
        ${imageContent}
      </div>

      <div class="product-content">
        <p class="product-category">${escapeHTML(product.category || "Producto")}</p>
        <h3 class="product-title">${escapeHTML(product.title)}</h3>
        <p class="product-description">${escapeHTML(product.description || "Producto disponible en PocketStore.")}</p>
        <p class="product-price">$${Number(product.price).toFixed(2)}</p>
      </div>
    `;

    productList.appendChild(card);
  });

  productCount.textContent = `${products.length} producto${products.length === 1 ? "" : "s"}`;
}

function getCategoryEmoji(category = "") {
  const value = category.toLowerCase();

  if (value.includes("elect")) return "💻";
  if (value.includes("ropa") || value.includes("clothing")) return "👕";
  if (value.includes("acces")) return "🎒";
  if (value.includes("hogar")) return "🏠";

  return "🛍️";
}

function showMessage(text) {
  message.textContent = text;
  message.classList.remove("hidden");
}

function hideMessage() {
  message.classList.add("hidden");
}

function escapeHTML(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    console.warn("Este navegador no soporta Service Workers.");
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register("./sw.js");
    console.log("Service Worker registrado:", registration.scope);
  } catch (error) {
    console.error("Error al registrar el Service Worker:", error);
  }
}
