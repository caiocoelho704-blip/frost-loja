Skip to content
caiocoelho704-blip
frost-loja
Repository navigation
Code
Issues
Pull requests
Actions
Projects
Wiki
Security and quality
Insights
Settings
Files
Go to file
t
T
assets
README.md
index.html
script.js
styles.css
frost-loja
/
script.js
in
main

Edit

Preview
Indent mode

Spaces
Indent size

2
Line wrap mode

No wrap
Editing script.js file contents
  1
  2
  3
  4
  5
  6
  7
  8
  9
 10
 11
 12
 13
 14
 15
 16
 17
 18
 19
 20
 21
 22
 23
 24
 25
 26
 27
 28
 29
 30
 31
 32
 33
 34
 35
 36
 37
 38
 39
 40
 41
 42
 43
 44
 45
 46
 47
 48
 49
 50
 51
 52
 53
 54
 55
 56
 57
 58
 59
 60
 61
 62
 63
 64
// ======================================================
// FROST ACESSÓRIOS - SCRIPT PRINCIPAL
// ======================================================

// ======================================================
// CONFIGURAÇÕES
// ======================================================

const SUPABASE_URL = "https://vcfgiimsyurlqfnftlkm.supabase.co";
const SUPABASE_KEY = "sb_publishable_iIuTPrdDe1g2aMpuoE5IsA_DN2bYAoH";

// WhatsApp da Frost
const WHATSAPP_NUMBER = "5585998238173";

// ======================================================
// PRODUTOS
// ======================================================

let products = [];
let currentFilter = "all";

// ======================================================
// CARRINHO
// ======================================================

let cart = JSON.parse(
  localStorage.getItem("frost-cart") || "[]"
);

// ======================================================
// FORMATAÇÃO DE PREÇO
// ======================================================

const money = (value) => {

  const number = Number(value) || 0;

  return number.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });

};

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

Use Control + Shift + m to toggle the tab key moving focus. Alternatively, use esc then tab to move to the next interactive element on the page.
