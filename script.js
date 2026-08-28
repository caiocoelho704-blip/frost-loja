// ======================================================
// FROST ACESSÓRIOS - SCRIPT PRINCIPAL
// ======================================================

// ======================================================
// CONFIGURAÇÕES
// ======================================================

const SUPABASE_URL = "https://vcfgiimsyurlqfnftlkm.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_iIuTPrdDe1g2aMpuoE5IsA_DN2bYAoH";

// WhatsApp da Frost
const WHATSAPP_NUMBER = "5585998238173";

// ======================================================
// VARIÁVEIS
// ======================================================

let products = [];
let currentFilter = "all";

let cart = JSON.parse(
  localStorage.getItem("frost-cart") || "[]"
);

// ======================================================
// FORMATAÇÃO DE PREÇO
// ======================================================

function money(value) {

  const number = Number(value) || 0;

  return number.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });

}

// ======================================================
// PROTEÇÃO DE TEXTO
// ======================================================

function escapeHTML(text) {

  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}

// ======================================================
// CARREGAR PRODUTOS DO SUPABASE
// ======================================================

async function loadProducts() {

  try {

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/produtos?select=*`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    if (!response.ok) {

      throw new Error(
        `Erro Supabase: ${response.status}`
      );

    }

    const data = await response.json();

    products = data.map((p) => {

      const rawPrice =
        p.preço ??
        p.preco ??
        p.price ??
        0;

      const price = Number(
        String(rawPrice)
          .replace("R$", "")
          .replace(/\s/g, "")
          .replace(",", ".")
      ) || 0;

      return {

        id: p.id,

        name:
          p.nome ||
          "Produto",

        category:
          p.tipo ||
          "all",

        price: price,

        image:
          p.imagem ||
          "",

        icon: p.imagem
          ? `
            <img
              src="${escapeHTML(p.imagem)}"
              alt="${escapeHTML(p.nome || "Produto")}"
              loading="lazy"
              style="
                width:100%;
                height:100%;
                object-fit:contain;
              "
            >
          `
          : "📦",

        reviews: "0"

      };

    });

    console.log(
      "Produtos carregados:",
      products
    );

    renderProducts(products);

  } catch (error) {

    console.error(
      "Erro ao carregar produtos:",
      error
    );

    const grid =
      document.getElementById("productGrid");

    if (grid) {

      grid.innerHTML = `
        <div style="
          grid-column:1/-1;
          padding:30px;
          text-align:center;
        ">

          <strong>
            Não foi possível carregar os produtos.
          </strong>

          <br>

          <small>
            Tente atualizar a página.
          </small>

        </div>
      `;

    }

  }

}

// ======================================================
// RENDERIZAR PRODUTOS
// ======================================================

function renderProducts(list = products) {

  const grid =
    document.getElementById("productGrid");

  if (!grid) return;

  if (!list.length) {

    grid.innerHTML = `
      <div style="
        grid-column:1/-1;
        padding:40px;
        text-align:center;
      ">

        <h3>
          Nenhum produto encontrado
        </h3>

        <p>
          Experimente outra categoria ou pesquisa.
        </p>

      </div>
    `;

    return;

  }

  grid.innerHTML = list.map((p) => `

    <article class="product-card">

      <div class="product-image">
        ${p.icon}
      </div>

      <div class="product-info">

        <h3>
          ${escapeHTML(p.name)}
        </h3>

        <div class="stars">
          ★★★★★
          <span class="reviews">
            (${p.reviews})
          </span>
        </div>

        <div class="price">
          ${money(p.price)}
        </div>

        <div class="installment">
          ou 12x de ${money(p.price / 12)}
        </div>

        <button
          class="add-cart"
          data-add="${p.id}"
        >
          Adicionar ao carrinho
        </button>

      </div>

    </article>

  `).join("");

  grid
    .querySelectorAll("[data-add]")
    .forEach((button) => {

      button.addEventListener(
        "click",
        () => {

          addToCart(
            button.dataset.add
          );

        }
      );

    });

}

// ======================================================
// SALVAR CARRINHO
// ======================================================

function saveCart() {

  localStorage.setItem(
    "frost-cart",
    JSON.stringify(cart)
  );

}

// ======================================================
// ADICIONAR AO CARRINHO
// ======================================================

function addToCart(id) {

  const product =
    products.find(
      (p) =>
        String(p.id) === String(id)
    );

  if (!product) {

    console.error(
      "Produto não encontrado:",
      id
    );

    return;

  }

  const existing =
    cart.find(
      (item) =>
        String(item.id) === String(id)
    );

  if (existing) {

    existing.qty += 1;

  } else {

    cart.push({

      id: product.id,

      name: product.name,

      price: product.price,

      image: product.image,

      icon: product.icon,

      qty: 1

    });

  }

  saveCart();

  updateCart();

  openCart();

}

// ======================================================
// AUMENTAR QUANTIDADE
// ======================================================

function increaseQuantity(id) {

  const item =
    cart.find(
      (product) =>
        String(product.id) === String(id)
    );

  if (!item) return;

  item.qty += 1;

  saveCart();

  updateCart();

}

// ======================================================
// DIMINUIR QUANTIDADE
// ======================================================

function decreaseQuantity(id) {

  const item =
    cart.find(
      (product) =>
        String(product.id) === String(id)
    );

  if (!item) return;

  if (item.qty > 1) {

    item.qty -= 1;

  } else {

    cart =
      cart.filter(
        (product) =>
          String(product.id) !== String(id)
      );

  }

  saveCart();

  updateCart();

}

// ======================================================
// REMOVER PRODUTO
// ======================================================

function removeFromCart(id) {

  cart =
    cart.filter(
      (item) =>
        String(item.id) !== String(id)
    );

  saveCart();

  updateCart();

}

// ======================================================
// CALCULAR TOTAL
// ======================================================

function getCartTotal() {

  return cart.reduce(
    (total, item) =>
      total +
      (Number(item.price) || 0) *
      item.qty,
    0
  );

}

// ======================================================
// ATUALIZAR CARRINHO
// ======================================================

function updateCart() {

  const count =
    cart.reduce(
      (total, item) =>
        total + item.qty,
      0
    );

  const total =
    getCartTotal();

  const cartCount =
    document.getElementById("cartCount");

  const cartTotal =
    document.getElementById("cartTotal");

  const cartItems =
    document.getElementById("cartItems");

  if (cartCount) {

    cartCount.textContent =
      count;

  }

  if (cartTotal) {

    cartTotal.textContent =
      money(total);

  }

  if (!cartItems) return;

  if (!cart.length) {

    cartItems.innerHTML = `

      <div style="
        text-align:center;
        padding:30px 10px;
      ">

        <div style="
          font-size:45px;
          margin-bottom:10px;
        ">
          🛒
        </div>

        <strong>
          Seu carrinho está vazio
        </strong>

        <p>
          Adicione produtos para continuar.
        </p>

      </div>

    `;

    return;

  }

  cartItems.innerHTML =
    cart.map((item) => `

      <div class="cart-item">

        <div class="cart-item-img">
          ${item.icon || "📦"}
        </div>

        <div>

          <strong>
            ${escapeHTML(item.name)}
          </strong>

          <small>
            ${money(item.price)}
          </small>

          <div style="
            display:flex;
            align-items:center;
            gap:8px;
            margin-top:8px;
          ">

            <button
              type="button"
              class="qty-minus"
              data-minus="${item.id}"
              aria-label="Diminuir quantidade"
              style="
                width:28px;
                height:28px;
                border:1px solid #ddd;
                background:#fff;
                cursor:pointer;
                border-radius:4px;
                font-size:18px;
              "
            >
              −
            </button>

            <strong>
              ${item.qty}
            </strong>

            <button
              type="button"
              class="qty-plus"
              data-plus="${item.id}"
              aria-label="Aumentar quantidade"
              style="
                width:28px;
                height:28px;
                border:1px solid #ddd;
                background:#fff;
                cursor:pointer;
                border-radius:4px;
                font-size:18px;
              "
            >
              +
            </button>

          </div>

          <small style="
            display:block;
            margin-top:6px;
          ">
            Subtotal:
            ${money(item.price * item.qty)}
          </small>

        </div>

        <button
          type="button"
          class="remove"
          data-remove="${item.id}"
        >
          Excluir
        </button>

      </div>

    `).join("");

  cartItems
    .querySelectorAll("[data-minus]")
    .forEach((button) => {

      button.addEventListener(
        "click",
        () => {

          decreaseQuantity(
            button.dataset.minus
          );

        }
      );

    });

  cartItems
    .querySelectorAll("[data-plus]")
    .forEach((button) => {

      button.addEventListener(
        "click",
        () => {

          increaseQuantity(
            button.dataset.plus
          );

        }
      );

    });

  cartItems
    .querySelectorAll("[data-remove]")
    .forEach((button) => {

      button.addEventListener(
        "click",
        () => {

          removeFromCart(
            button.dataset.remove
          );

        }
      );

    });

}

// ======================================================
// ABRIR CARRINHO
// ======================================================

function openCart() {

  const panel =
    document.getElementById("cartPanel");

  const overlay =
    document.getElementById("overlay");

  if (panel) {

    panel.classList.add("open");

    panel.setAttribute(
      "aria-hidden",
      "false"
    );

  }

  if (overlay) {

    overlay.classList.add("show");

  }

}

// ======================================================
// FECHAR CARRINHO
// ======================================================

function closeCart() {

  const panel =
    document.getElementById("cartPanel");

  const overlay =
    document.getElementById("overlay");

  if (panel) {

    panel.classList.remove("open");

    panel.setAttribute(
      "aria-hidden",
      "true"
    );

  }

  if (overlay) {

    overlay.classList.remove("show");

  }

}

// ======================================================
// FILTRAR CATEGORIA
// ======================================================

function filter(category) {

  currentFilter =
    category;

  let list;

  if (
    category === "all" ||
    category === "offers"
  ) {

    list =
      products;

  } else {

    list =
      products.filter(
        (product) =>
          String(product.category)
            .toLowerCase()
            .trim() ===
          String(category)
            .toLowerCase()
            .trim()
      );

  }

  renderProducts(list);

  const section =
    document.getElementById(
      "productsSection"
    );

  if (section) {

    section.scrollIntoView({
      behavior: "smooth"
    });

  }

}

// ======================================================
// PESQUISA
// ======================================================

function searchProducts() {

  const input =
    document.getElementById(
      "searchInput"
    );

  const categorySelect =
    document.getElementById(
      "categoryFilter"
    );

  if (!input) return;

  const query =
    input.value
      .toLowerCase()
      .trim();

  const category =
    categorySelect
      ? categorySelect.value
      : "all";

  const list =
    products.filter((product) => {

      const matchesCategory =
        category === "all" ||
        String(product.category)
          .toLowerCase()
          .trim() ===
        String(category)
          .toLowerCase()
          .trim();

      const matchesName =
        product.name
          .toLowerCase()
          .includes(query);

      return (
        matchesCategory &&
        matchesName
      );

    });

  renderProducts(list);

  const section =
    document.getElementById(
      "productsSection"
    );

  if (section) {

    section.scrollIntoView({
      behavior: "smooth"
    });

  }

}

// ======================================================
// FINALIZAR PEDIDO PELO WHATSAPP
// ======================================================

function checkoutWhatsApp() {

  if (!cart.length) {

    alert(
      "Seu carrinho está vazio."
    );

    return;

  }

  const total =
    getCartTotal();

  let message =
    "Olá! 👋 Quero fazer um pedido na Frost Acessórios.\n\n";

  message +=
    "🛒 *MEU PEDIDO*\n";

  message +=
    "━━━━━━━━━━━━━━━━━━\n";

  cart.forEach((item) => {

    const subtotal =
      (Number(item.price) || 0) *
      item.qty;

    message +=
      `📦 ${item.name}\n`;

    message +=
      `Quantidade: ${item.qty}\n`;

    message +=
      `Valor unitário: ${money(item.price)}\n`;

    message +=
      `Subtotal: ${money(subtotal)}\n\n`;

  });

  message +=
    "━━━━━━━━━━━━━━━━━━\n";

  message +=
    `💰 *TOTAL: ${money(total)}*\n\n`;

  message +=
    "Gostaria de receber as opções de pagamento e o link seguro para finalizar a compra.";

  const encodedMessage =
    encodeURIComponent(message);

  const whatsappURL =
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

  window.open(
    whatsappURL,
    "_blank",
    "noopener,noreferrer"
  );

}

// ======================================================
// CARROSSEL FROST
// ======================================================

const banners = [

  {
    eyebrow: "TECNOLOGIA",
    title: "AO SEU ALCANCE",
    text:
      "Os melhores acessórios com<br>qualidade e preço baixo!"
  },

  {
    eyebrow: "OFERTAS FROST",
    title: "PREÇOS QUE CABEM NO BOLSO",
    text:
      "Produtos selecionados com<br>ótimos preços para você!"
  },

  {
    eyebrow: "NOVIDADES",
    title: "TECNOLOGIA NA SUA MÃO",
    text:
      "Confira os novos produtos<br>da Frost Acessórios!"
  },

  {
    eyebrow: "FROST ACESSÓRIOS",
    title: "COMPRE COM SEGURANÇA",
    text:
      "Qualidade, preço justo e<br>envio para todo o Brasil!"
  }

];

let currentBanner = 0;
let bannerTimer = null;

let hero = null;
let eyebrow = null;
let title = null;
let text = null;
let leftButton = null;
let rightButton = null;
let dots = [];


// ======================================================
// MOSTRAR BANNER
// ======================================================

function showBanner(index) {

  if (!hero) return;

  currentBanner =
    (index + banners.length) %
    banners.length;

  const banner =
    banners[currentBanner];

  if (eyebrow) {

    eyebrow.textContent =
      banner.eyebrow;

  }

  if (title) {

    title.textContent =
      banner.title;

  }

  if (text) {

    text.innerHTML =
      banner.text;

  }

  dots.forEach(
    (dot, i) => {

      dot.classList.toggle(
        "active",
        i === currentBanner
      );

    }
  );

}

// ======================================================
// PRÓXIMO BANNER
// ======================================================

function nextBanner() {

  showBanner(
    currentBanner + 1
  );

  restartTimer();

}

// ======================================================
// BANNER ANTERIOR
// ======================================================

function previousBanner() {

  showBanner(
    currentBanner - 1
  );

  restartTimer();

}

// ======================================================
// TIMER DO CARROSSEL
// ======================================================

function restartTimer() {

  clearInterval(
    bannerTimer
  );

  bannerTimer =
    setInterval(
      () => {

        showBanner(
          currentBanner + 1
        );

      },
      5000
    );

}

// ======================================================
// INICIALIZAR CARROSSEL
// ======================================================

function initializeCarousel() {

  hero =
    document.querySelector(
      ".hero"
    );

  eyebrow =
    document.querySelector(
      ".hero-copy .eyebrow"
    );

  title =
    document.querySelector(
      ".hero-copy h1"
    );

  text =
    document.querySelector(
      ".hero-copy > p:not(.eyebrow)"
    );

  leftButton =
    document.querySelector(
      ".hero-arrow.left"
    );

  rightButton =
    document.querySelector(
      ".hero-arrow.right"
    );

  dots =
    document.querySelectorAll(
      ".dots i"
    );

  // SETA ESQUERDA

  if (leftButton) {

    leftButton.addEventListener(
      "click",
      (event) => {

        event.stopPropagation();

        previousBanner();

      }
    );

  }

  // SETA DIREITA

  if (rightButton) {

    rightButton.addEventListener(
      "click",
      (event) => {

        event.stopPropagation();

        nextBanner();

      }
    );

  }

  // BOLINHAS

  dots.forEach(
    (dot, index) => {

      dot.addEventListener(
        "click",
        (event) => {

          event.stopPropagation();

          showBanner(index);

          restartTimer();

        }
      );

    }
  );

  // ==================================================
  // ARRASTAR COM MOUSE
  // ==================================================

  let mouseStartX = 0;
  let isDragging = false;

  if (hero) {

    hero.addEventListener(
      "mousedown",
      (event) => {

        mouseStartX =
          event.clientX;

        isDragging = true;

        hero.style.cursor =
          "grabbing";

      }
    );

    hero.addEventListener(
      "mouseup",
      (event) => {

        if (!isDragging)
          return;

        const mouseEndX =
          event.clientX;

        const difference =
          mouseStartX -
          mouseEndX;

        isDragging = false;

        hero.style.cursor =
          "";

        if (
          Math.abs(difference) < 50
        ) {

          return;

        }

        if (difference > 0) {

          nextBanner();

        } else {

          previousBanner();

        }

      }
    );

    hero.addEventListener(
      "mouseleave",
      () => {

        isDragging = false;

        hero.style.cursor =
          "";

      }
    );

  }

  // ==================================================
  // DESLIZAR NO CELULAR
  // ==================================================

  let touchStartX = 0;

  if (hero) {

    hero.addEventListener(
      "touchstart",
      (event) => {

        touchStartX =
          event.touches[0].clientX;

      },
      {
        passive: true
      }
    );

    hero.addEventListener(
      "touchend",
      (event) => {

        const touchEndX =
          event.changedTouches[0].clientX;

        const difference =
          touchStartX -
          touchEndX;

        if (
          Math.abs(difference) < 50
        ) {

          return;

        }

        if (difference > 0) {

          nextBanner();

        } else {

          previousBanner();

        }

      },
      {
        passive: true
      }
    );

  }

  showBanner(0);

  restartTimer();

}

// ======================================================
// INICIALIZAÇÃO DA PÁGINA
// ======================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    // CARRINHO

    updateCart();

    // PRODUTOS

    loadProducts();

    // CARROSSEL

    initializeCarousel();

    // ==================================================
    // BOTÕES DE CATEGORIA
    // ==================================================

    document
      .querySelectorAll("[data-category]")
      .forEach((button) => {

        button.addEventListener(
          "click",
          () => {

            filter(
              button.dataset.category
            );

          }
        );

      });

    // ==================================================
    // BOTÃO CARRINHO
    // ==================================================

    const cartButton =
      document.getElementById(
        "cartButton"
      );

    if (cartButton) {

      cartButton.addEventListener(
        "click",
        openCart
      );

    }

    // ==================================================
    // FECHAR CARRINHO
    // ==================================================

    const closeCartButton =
      document.getElementById(
        "closeCart"
      );

    if (closeCartButton) {

      closeCartButton.addEventListener(
        "click",
        closeCart
      );

    }

    const overlay =
      document.getElementById(
        "overlay"
      );

    if (overlay) {

      overlay.addEventListener(
        "click",
        closeCart
      );

    }

    // ==================================================
    // COMPRAR AGORA
    // ==================================================

    const heroShop =
      document.getElementById(
        "heroShop"
      );

    if (heroShop) {

      heroShop.addEventListener(
        "click",
        () => {

          filter("all");

        }
      );

    }

    // ==================================================
    // OFERTAS
    // ==================================================

    const allOffers =
      document.getElementById(
        "allOffers"
      );

    if (allOffers) {

      allOffers.addEventListener(
        "click",
        () => {

          filter("offers");

        }
      );

    }

    // ==================================================
    // PESQUISA
    // ==================================================

    const searchForm =
      document.getElementById(
        "searchForm"
      );

    if (searchForm) {

      searchForm.addEventListener(
        "submit",
        (event) => {

          event.preventDefault();

          searchProducts();

        }
      );

    }

    // ==================================================
    // FINALIZAR PEDIDO
    // ==================================================

    const checkoutButton =
      document.getElementById(
        "checkoutButton"
      );

    if (checkoutButton) {

      checkoutButton.textContent =
        "PEDIR PELO WHATSAPP";

      checkoutButton.addEventListener(
        "click",
        checkoutWhatsApp
      );

    }

  }
);
