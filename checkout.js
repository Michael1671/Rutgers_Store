// checkout.js — only runs on checkout.html.
// Requires cart.js to be loaded first.
// Include with: <script src="cart.js"></script> <script src="checkout.js"></script>

document.addEventListener('DOMContentLoaded', () => {
  const itemsContainer = document.getElementById('checkout-items-list');
  const emptyMsg = document.getElementById('checkout-empty');
  const itemsHeaderCount = document.getElementById('checkout-items-count');
  const selectAllCheckbox = document.getElementById('select-all');
  const subtotalEl = document.getElementById('summary-subtotal');
  const totalEl = document.getElementById('summary-total');
  const thumbsEl = document.getElementById('summary-thumbs');
  const checkoutBtn = document.getElementById('checkout-btn');

  function render() {
    const cart = RugbyCart.getCart();
    itemsContainer.innerHTML = '';
    emptyMsg.style.display = cart.length === 0 ? 'block' : 'none';
    itemsHeaderCount.textContent = cart.length;

    const SIZES = ['S', 'M', 'L', 'XL'];

    cart.forEach((item) => {
      const row = document.createElement('div');
      row.className = 'checkout_item';
      row.innerHTML = `
        <label class="checkout_checkbox">
          <input type="checkbox" class="item-checkbox"
                 data-id="${item.id}" data-variant="${item.variant}" checked>
        </label>
        <div class="checkout_item_image">
          <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="checkout_item_details">
          <h4>${item.name}</h4>
          <select class="checkout_item_size_select" data-id="${item.id}" data-variant="${item.variant}">
            ${SIZES.map(
              (size) =>
                `<option value="${size}" ${size === item.variant ? 'selected' : ''}>Size ${size}</option>`
            ).join('')}
          </select>
          <div class="checkout_item_footer">
            <span class="checkout_item_price">$${(item.price * item.qty).toFixed(2)}</span>
            <div class="checkout_item_qty">
              <button class="qty_btn" data-action="decrease" data-id="${item.id}" data-variant="${item.variant}">−</button>
              <span class="qty_value">${item.qty}</span>
              <button class="qty_btn" data-action="increase" data-id="${item.id}" data-variant="${item.variant}">+</button>
            </div>
          </div>
        </div>
        <button class="checkout_item_remove" data-id="${item.id}" data-variant="${item.variant}">
          <i class="ri-delete-bin-line"></i>
        </button>
      `;
      itemsContainer.appendChild(row);
    });

    updateTotals();
  }

  function updateTotals() {
    const cart = RugbyCart.getCart();
    const checkedKeys = new Set(
      Array.from(itemsContainer.querySelectorAll('.item-checkbox:checked')).map(
        (cb) => cb.dataset.id + '|' + cb.dataset.variant
      )
    );
    const selected = cart.filter((item) =>
      checkedKeys.has(item.id + '|' + item.variant)
    );
    const subtotal = selected.reduce((sum, i) => sum + i.price * i.qty, 0);

    subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    totalEl.textContent = `$${subtotal.toFixed(2)}`;
    thumbsEl.innerHTML = selected
      .map((i) => `<img src="${i.image}" alt="${i.name}">`)
      .join('');

    const selectedCount = selected.reduce((s, i) => s + i.qty, 0);
    checkoutBtn.textContent = `Checkout Now (${selectedCount})`;
    checkoutBtn.disabled = selectedCount === 0;

    const allBoxes = itemsContainer.querySelectorAll('.item-checkbox');
    selectAllCheckbox.checked =
      allBoxes.length > 0 && checkedKeys.size === allBoxes.length;
  }

  // Delegated events — works for rows that get re-rendered
  itemsContainer.addEventListener('click', (e) => {
    const qtyBtn = e.target.closest('.qty_btn');
    const removeBtn = e.target.closest('.checkout_item_remove');

    if (qtyBtn) {
      const { id, variant, action } = qtyBtn.dataset;
      RugbyCart.updateQty(id, variant, action === 'increase' ? 1 : -1);
      render();
    }
    if (removeBtn) {
      const { id, variant } = removeBtn.dataset;
      RugbyCart.removeFromCart(id, variant);
      render();
    }
  });

  itemsContainer.addEventListener('change', (e) => {
    if (e.target.classList.contains('item-checkbox')) {
      updateTotals();
    }

    if (e.target.classList.contains('checkout_item_size_select')) {
      const { id, variant } = e.target.dataset;
      const newVariant = e.target.value;
      if (newVariant !== variant) {
        RugbyCart.changeVariant(id, variant, newVariant);
        render();
      }
    }
  });

  selectAllCheckbox.addEventListener('change', () => {
    itemsContainer.querySelectorAll('.item-checkbox').forEach((cb) => {
      cb.checked = selectAllCheckbox.checked;
    });
    updateTotals();
  });

  checkoutBtn.addEventListener('click', () => {
    // Placeholder — this is the hook point for step 6 (real payment processing).
    // Replace this with a call to your backend, which creates a Stripe
    // Checkout Session (or similar) and redirects the browser to it.
    alert(
      'Demo checkout — no real payment is being taken. ' +
      'Wire this button to a backend endpoint + Stripe (or another processor) to go live.'
    );
  });

  render();
});