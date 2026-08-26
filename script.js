let products = [];

const SUPABASE_URL = "https://vcfgiimsyurlqfnftlkm.supabase.co";
const SUPABASE_KEY = "sb_publishable_iIuTPrdDe1g2aMpuoE5IsA_DN2bYAoH";

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
      throw new Error(`Erro Supabase: ${response.status}`);
    }

    const data = await response.json();

    products = data.map(p => ({
      id: p.id,
      name: p.nome,
      category: p.tipo,
      price: Number(String(p.preço ?? p.preco ?? p.price).replace(",", ".")),
      icon: p.imagem
        ? `<img src="${p.imagem}" alt="${p.nome}" style="width:100%;height:100%;object-fit:contain;">`
        : "📦",
      reviews: "0"
    }));

    renderProducts(products);

  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
  }
}

loadProducts();

let cart = JSON.parse(localStorage.getItem("frost-cart") || "[]");
let currentFilter = "all";

const money = v => v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});

function renderProducts(list=products){
  const grid=document.getElementById("productGrid");
  grid.innerHTML=list.map(p=>`
    <article class="product-card">
      <div class="product-image">${p.icon}</div>
      <div class="product-info">
        <h3>${p.name}</h3>
        <div class="stars">★★★★★ <span class="reviews">(${p.reviews})</span></div>
        <div class="price">${money(p.price)}</div>
        <div class="installment">ou 12x de ${money(p.price/12)}</div>
        <button class="add-cart" data-add="${p.id}">Adicionar ao carrinho</button>
      </div>
    </article>`).join("");
  grid.querySelectorAll("[data-add]").forEach(b=>b.addEventListener("click",()=>addToCart(+b.dataset.add)));
}

function saveCart(){localStorage.setItem("frost-cart",JSON.stringify(cart));}

function addToCart(id){
  const p=products.find(x=>x.id===id);
  const found=cart.find(x=>x.id===id);
  if(found) found.qty++;
  else cart.push({...p,qty:1});
  saveCart(); updateCart();
  openCart();
}

function removeFromCart(id){
  cart=cart.filter(x=>x.id!==id);
  saveCart(); updateCart();
}

function updateCart(){
  const count=cart.reduce((s,x)=>s+x.qty,0);
  const total=cart.reduce((s,x)=>s+x.price*x.qty,0);
  document.getElementById("cartCount").textContent=count;
  document.getElementById("cartTotal").textContent=money(total);
  const box=document.getElementById("cartItems");
  box.innerHTML=cart.length?cart.map(x=>`
    <div class="cart-item">
      <div class="cart-item-img">${x.icon}</div>
      <div><strong>${x.name}</strong><small>Qtd: ${x.qty} · ${money(x.price*x.qty)}</small></div>
      <button class="remove" data-remove="${x.id}">Excluir</button>
    </div>`).join(""):`<p>Seu carrinho está vazio.</p>`;
  box.querySelectorAll("[data-remove]").forEach(b=>b.addEventListener("click",()=>removeFromCart(+b.dataset.remove)));
}

function openCart(){
  document.getElementById("cartPanel").classList.add("open");
  document.getElementById("overlay").classList.add("show");
}
function closeCart(){
  document.getElementById("cartPanel").classList.remove("open");
  document.getElementById("overlay").classList.remove("show");
}
function filter(category){
  currentFilter=category;
  const list=category==="all"||category==="offers"?products:products.filter(p=>p.category===category);
  renderProducts(list);
  document.getElementById("productsSection").scrollIntoView({behavior:"smooth"});
}

document.querySelectorAll("[data-category]").forEach(b=>b.addEventListener("click",()=>filter(b.dataset.category)));
document.getElementById("cartButton").onclick=openCart;
document.getElementById("closeCart").onclick=closeCart;
document.getElementById("overlay").onclick=closeCart;
document.getElementById("heroShop").onclick=()=>filter("all");
document.getElementById("allOffers").onclick=()=>filter("offers");

document.getElementById("searchForm").addEventListener("submit",e=>{
  e.preventDefault();
  const q=document.getElementById("searchInput").value.toLowerCase().trim();
  const category=document.getElementById("categoryFilter").value;
  const list=products.filter(p=>(category==="all"||p.category===category)&&p.name.toLowerCase().includes(q));
  renderProducts(list);
  document.getElementById("productsSection").scrollIntoView({behavior:"smooth"});
});

document.getElementById("checkoutButton").onclick=()=>{
  if(!cart.length){alert("Seu carrinho está vazio.");return;}
  alert("A próxima etapa será conectar este botão ao sistema real de pedidos.");
};
// ===============================
// CARROSSEL FROST
// ===============================

const banners = [
  {
    eyebrow: "TECNOLOGIA",
    title: "AO SEU ALCANCE",
    text: "Os melhores acessórios com<br>qualidade e preço baixo!"
  },
  {
    eyebrow: "OFERTAS FROST",
    title: "PREÇOS QUE CABEM NO BOLSO",
    text: "Produtos selecionados com<br>ótimos preços para você!"
  },
  {
    eyebrow: "NOVIDADES",
    title: "TECNOLOGIA NA SUA MÃO",
    text: "Confira os novos produtos<br>da Frost Acessórios!"
  },
  {
    eyebrow: "FROST ACESSÓRIOS",
    title: "COMPRE COM SEGURANÇA",
    text: "Qualidade, preço justo e<br>envio para todo o Brasil!"
  }
];

let currentBanner = 0;
let bannerTimer = null;

const hero = document.querySelector(".hero");
const eyebrow = document.querySelector(".hero-copy .eyebrow");
const title = document.querySelector(".hero-copy h1");
const text = document.querySelector(".hero-copy > p:not(.eyebrow)");
const leftButton = document.querySelector(".hero-arrow.left");
const rightButton = document.querySelector(".hero-arrow.right");
const dots = document.querySelectorAll(".dots i");

function showBanner(index) {

  currentBanner =
    (index + banners.length) % banners.length;

  const banner = banners[currentBanner];

  eyebrow.textContent = banner.eyebrow;
  title.textContent = banner.title;
  text.innerHTML = banner.text;

  dots.forEach((dot, i) => {
    dot.classList.toggle(
      "active",
      i === currentBanner
    );
  });
}

function nextBanner() {
  showBanner(currentBanner + 1);
  restartTimer();
}

function previousBanner() {
  showBanner(currentBanner - 1);
  restartTimer();
}

function restartTimer() {

  clearInterval(bannerTimer);

  bannerTimer = setInterval(() => {
    showBanner(currentBanner + 1);
  }, 5000);
}


// ===============================
// SETAS
// ===============================

if (leftButton) {
  leftButton.addEventListener("click", previousBanner);
}

if (rightButton) {
  rightButton.addEventListener("click", nextBanner);
}


// ===============================
// BOLINHAS
// ===============================

dots.forEach((dot, index) => {

  dot.addEventListener("click", () => {

    showBanner(index);
    restartTimer();

  });

});


// ===============================
// ARRASTAR COM MOUSE
// ===============================

let startX = 0;
let isDragging = false;

hero.addEventListener("mousedown", (event) => {

  startX = event.clientX;
  isDragging = true;

});

hero.addEventListener("mouseup", (event) => {

  if (!isDragging) return;

  const endX = event.clientX;
  const difference = startX - endX;

  isDragging = false;

  if (Math.abs(difference) < 50) return;

  if (difference > 0) {
    nextBanner();
  } else {
    previousBanner();
  }

});

hero.addEventListener("mouseleave", () => {
  isDragging = false;
});


// ===============================
// DESLIZAR NO CELULAR
// ===============================

let touchStartX = 0;

hero.addEventListener("touchstart", (event) => {

  touchStartX =
    event.touches[0].clientX;

}, { passive: true });


hero.addEventListener("touchend", (event) => {

  const touchEndX =
    event.changedTouches[0].clientX;

  const difference =
    touchStartX - touchEndX;

  if (Math.abs(difference) < 50) return;

  if (difference > 0) {
    nextBanner();
  } else {
    previousBanner();
  }

}, { passive: true });


// ===============================
// INICIAR
// ===============================

showBanner(0);
restartTimer();
