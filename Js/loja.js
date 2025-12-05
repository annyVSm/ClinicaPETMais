/* loja.js */
(function(){
  const PRODUCTS = [
    { id: 1, title: 'Ração Premium 10kg', price: 179.90, img: '' },
    { id: 2, title: 'Tapete Higiênico - 30un', price: 29.50, img: '' },
    { id: 3, title: 'Brinquedo Mordedor', price: 19.90, img: '' },
    { id: 4, title: 'Coleira + Guia', price: 39.00, img: '' },
    { id: 5, title: 'Cama Confortável', price: 199.00, img: '' }
  ];

  const KEY = 'clinicapetmais_cart_v1';
  let cart = storage.read(KEY, []);

  const productsNode = document.getElementById('products');
  const cartPanel = document.getElementById('cartPanel');
  const cartToggle = document.getElementById('cartToggle');
  const closeCart = document.getElementById('closeCart');
  const overlay = document.getElementById('overlay');
  const cartItemsNode = document.getElementById('cartItems');
  const cartTotalNode = document.getElementById('cartTotal');
  const cartCountNode = document.getElementById('cartCount');
  const clearBtn = document.getElementById('clearCart');
  const checkoutBtn = document.getElementById('checkoutBtn');

  function saveCart(){ storage.write(KEY, cart); updateCartUI(); }

  function renderProducts(){
    productsNode.innerHTML = '';
    PRODUCTS.forEach(p => {
      const card = document.createElement('article');
      card.className = 'product-card';
      card.innerHTML = `
        <img src="${p.img || 'https://images.unsplash.com/photo-1601758123927-7c0c8b9f6c32?auto=format&fit=crop&w=800&q=60'}" alt="${escapeHtml(p.title)}">
        <h4>${escapeHtml(p.title)}</h4>
        <div class="price">R$ ${p.price.toFixed(2)}</div>
        <div style="margin-top:auto;width:100%"><button class="btn" data-add="${p.id}">Adicionar ao carrinho</button></div>
      `;
      productsNode.appendChild(card);
    });
  }

  function updateCartUI(){
    // count
    const count = cart.reduce((s,i)=> s + i.qtd, 0);
    cartCountNode && (cartCountNode.textContent = count);
    // items
    cartItemsNode.innerHTML = '';
    if (!cart.length) {
      cartItemsNode.innerHTML = '<li class="muted">Carrinho vazio</li>';
      cartTotalNode && (cartTotalNode.textContent = '0.00');
      return;
    }
    let total = 0;
    cart.forEach(item => {
      total += item.price * item.qtd;
      const li = document.createElement('li');
      li.className = 'cart-item';
      li.innerHTML = `
        <div class="meta">
          <strong>${escapeHtml(item.title)}</strong>
          <div class="small">R$ ${item.price.toFixed(2)}</div>
        </div>
        <div class="qty-controls">
          <button class="btn btn-small" data-action="dec" data-id="${item.id}">-</button>
          <div style="min-width:28px;text-align:center">${item.qtd}</div>
          <button class="btn btn-small" data-action="inc" data-id="${item.id}">+</button>
          <button class="btn btn-outline" data-action="rem" data-id="${item.id}">Rem</button>
        </div>
      `;
      cartItemsNode.appendChild(li);
    });
    cartTotalNode && (cartTotalNode.textContent = total.toFixed(2));
  }

  // add product
  productsNode?.addEventListener('click', (e)=>{
    const btn = e.target.closest('button[data-add]');
    if (!btn) return;
    const id = Number(btn.dataset.add);
    const prod = PRODUCTS.find(p=>p.id===id);
    if (!prod) return;
    const found = cart.find(i=>i.id===id);
    if (found) found.qtd++;
    else cart.push({ id: prod.id, title: prod.title, price: prod.price, qtd: 1 });
    saveCart();
    openCart();
  });

  // cart actions
  cartItemsNode?.addEventListener('click', (e)=>{
    const btn = e.target.closest('button');
    if (!btn) return;
    const action = btn.dataset.action;
    const id = Number(btn.dataset.id);
    if (action === 'inc') {
      const it = cart.find(i=>i.id===id); if (it) it.qtd++;
    }
    if (action === 'dec') {
      const it = cart.find(i=>i.id===id); if (it) { it.qtd--; if (it.qtd<=0) cart = cart.filter(x=>x.id!==id); }
    }
    if (action === 'rem') {
      cart = cart.filter(x=>x.id!==id);
    }
    saveCart();
  });

  // toggle cart
  cartToggle?.addEventListener('click', openCart);
  closeCart?.addEventListener('click', closeCartFn);
  overlay?.addEventListener('click', closeCartFn);

  function openCart(){
    cartPanel.classList.add('open');
    overlay.classList.add('show');
    updateCartUI();
  }
  function closeCartFn(){
    cartPanel.classList.remove('open');
    overlay.classList.remove('show');
  }

  // clear
  clearBtn?.addEventListener('click', ()=>{
    if (!confirm('Limpar todo o carrinho?')) return;
    cart = []; saveCart();
  });

  // checkout (simulado)
  checkoutBtn?.addEventListener('click', ()=>{
    if (!cart.length) { alert('Carrinho vazio'); return; }
    const orderId = 'ORD' + Date.now();
    // salvar pedido simples em localStorage (opcional)
    const orders = storage.read('clinicapetmais_orders_v1', []);
    orders.push({ id: orderId, items: cart, total: cart.reduce((s,i)=> s + i.price*i.qtd,0), createdAt: new Date().toISOString() });
    storage.write('clinicapetmais_orders_v1', orders);
    cart = []; saveCart();
    alert('Compra finalizada! Pedido: ' + orderId);
    closeCartFn();
  });

  // helpers
  function escapeHtml(text){ return String(text).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  // iniciar
  renderProducts();
  updateCartUI();
})();
