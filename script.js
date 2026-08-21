const products = [
  {id:1,name:"iPhone 14 128GB Meia-noite",category:"celulares",price:4299,icon:"📱",reviews:"1.250"},
  {id:2,name:"Fone Bluetooth AirPods Pro 2",category:"fones",price:1299.90,icon:"🎧",reviews:"856"},
  {id:3,name:"Carregador Turbo 20W USB-C",category:"carregadores",price:89.90,icon:"🔌",reviews:"623"},
  {id:4,name:"Smartwatch X10 Tela AMOLED",category:"smartwatches",price:249.90,icon:"⌚",reviews:"432"},
  {id:5,name:"Capa Premium Anti-impacto",category:"capinhas",price:49.90,icon:"▣",reviews:"318"},
  {id:6,name:"Cabo USB-C Turbo 1m",category:"cabos",price:29.90,icon:"〰",reviews:"512"},
  {id:7,name:"Película 3D Full Cover",category:"peliculas",price:24.90,icon:"▤",reviews:"277"},
  {id:8,name:"Suporte Veicular Magnético",category:"suportes",price:39.90,icon:"▰",reviews:"198"}
];

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

renderProducts();
updateCart();
