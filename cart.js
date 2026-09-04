// cart.js — shared cart logic for all pages.
// Include this on EVERY page (index, catalogue, product pages, checkout)
// with: <script src="cart.js"></script>
// It must load before any page-specific script that uses window.RugbyCart.

(function () {
  const CART_KEY = 'rugby_cart';

  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartBadge();
    // Let any open page (or tab, via the storage event) know the cart changed
    document.dispatchEvent(new CustomEvent('cart:updated', { detail: cart }));
  }

  // product = { id, name, price, image, variant }
  function addToCart(product) {
    const cart = getCart();
    const existing = cart.find(
      (item) => item.id === product.id && item.variant === product.variant
    );
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ ...product, qty: 1 });
    }
    saveCart(cart);
    return cart;
  }

  function removeFromCart(id, variant) {
    const cart = getCart().filter(
      (item) => !(item.id === id && item.variant === variant)
    );
    saveCart(cart);
    return cart;
  }

  function updateQty(id, variant, delta) {
    const cart = getCart();
    const item = cart.find((i) => i.id === id && i.variant === variant);
    if (item) {
      item.qty = Math.max(1, item.qty + delta);
    }
    saveCart(cart);
    return cart;
  }

  // Changes an item's variant (e.g. size). If another line already exists
  // for the same product + new variant, merges quantities into that line
  // instead of creating a duplicate.
  function changeVariant(id, oldVariant, newVariant) {
    const cart = getCart();
    const itemIndex = cart.findIndex(
      (i) => i.id === id && i.variant === oldVariant
    );
    if (itemIndex === -1) return cart;

    const item = cart[itemIndex];
    const existingIndex = cart.findIndex(
      (i, idx) => idx !== itemIndex && i.id === id && i.variant === newVariant
    );

    if (existingIndex !== -1) {
      cart[existingIndex].qty += item.qty;
      cart.splice(itemIndex, 1);
    } else {
      item.variant = newVariant;
    }

    saveCart(cart);
    return cart;
  }

  function cartCount(cart) {
    cart = cart || getCart();
    return cart.reduce((sum, item) => sum + item.qty, 0);
  }

  function cartSubtotal(cart) {
    cart = cart || getCart();
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  function updateCartBadge() {
    const count = cartCount();
    document.querySelectorAll('.cart-count').forEach((el) => {
      el.textContent = count;
      el.style.display = count > 0 ? 'inline-flex' : 'none';
    });
  }

  // Auto-wires any element matching .product_card that has data-id/data-name/
  // data-price/data-image attributes and a .btn inside it for "Add to Cart".
  function initAddToCartButtons() {
    document.querySelectorAll('.product_card').forEach((card) => {
      const btn = card.querySelector('.btn');
      if (!btn || !card.dataset.id) return;
      // Links (e.g. "Select Size" -> selection.html) navigate instead of
      // quick-adding; only real <button> elements add straight to cart.
      if (btn.tagName === 'A') return;

      btn.addEventListener('click', () => {
        addToCart({
          id: card.dataset.id,
          name: card.dataset.name,
          price: parseFloat(card.dataset.price),
          image: card.dataset.image,
          variant: card.dataset.variant || '',
        });

        const originalText = btn.textContent;
        btn.textContent = 'Added!';
        btn.disabled = true;
        setTimeout(() => {
          btn.textContent = originalText;
          btn.disabled = false;
        }, 900);
      });
    });
  }

  // Keep multiple open tabs in sync
  window.addEventListener('storage', (e) => {
    if (e.key === CART_KEY) updateCartBadge();
  });

  window.RugbyCart = {
    getCart,
    saveCart,
    addToCart,
    removeFromCart,
    updateQty,
    changeVariant,
    cartCount,
    cartSubtotal,
    updateCartBadge,
  };

  document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    initAddToCartButtons();
  });
})();