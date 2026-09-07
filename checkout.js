const CHECKOUT_API_URL = 'https://rutgers-store-backend.vercel.app/api/Ccheckout';

document.addEventListener('DOMContentLoaded', () => {
  const itemsContainer = document.getElementById('checkout-items-list');
  const emptyMsg = document.getElementById('checkout-empty');
  const itemsHeaderCount = document.getElementById('checkout-items-count');
  const selectAllCheckbox = document.getElementById('select-all');
  const subtotalEl = document.getElementById('summary-subtotal');
  const totalEl = document.getElementById('summary-total');
  const thumbsEl = document.getElementById('summary-thumbs');
  const checkoutBtn = document.getElementById('checkout-btn');
  const itemTemplate = document.getElementById('checkout-item-template');

  function render() {
    const cart = RugbyCart.getCart();
    itemsContainer.innerHTML = '';
    emptyMsg.style.display = cart.length === 0 ? 'block' : 'none';
    itemsHeaderCount.textContent = cart.length;

    cart.forEach((item) => {
      const row = itemTemplate.content.cloneNode(true);
      const rowEl = row.querySelector('.checkout_item');

      const checkbox = row.querySelector('.item-checkbox');
      checkbox.dataset.id = item.id;
      checkbox.dataset.variant = item.variant;

      row.querySelector('.checkout_item_image img').src = item.image;
      row.querySelector('.checkout_item_image img').alt = item.name;
      row.querySelector('h4').textContent = item.name;

      const sizeSelect = row.querySelector('.checkout_item_size_select');
      sizeSelect.dataset.id = item.id;
      sizeSelect.dataset.variant = item.variant;
      sizeSelect.value = item.variant;

      row.querySelector('.checkout_item_price').textContent = `$${(item.price * item.qty).toFixed(2)}`;
      row.querySelector('.qty_value').textContent = item.qty;

      const decreaseBtn = row.querySelector('[data-action="decrease"]');
      decreaseBtn.dataset.id = item.id;
      decreaseBtn.dataset.variant = item.variant;

      const increaseBtn = row.querySelector('[data-action="increase"]');
      increaseBtn.dataset.id = item.id;
      increaseBtn.dataset.variant = item.variant;

      const removeBtn = row.querySelector('.checkout_item_remove');
      removeBtn.dataset.id = item.id;
      removeBtn.dataset.variant = item.variant;

      itemsContainer.appendChild(row);
    });

    updateTotals();
  }

  function getSelectedItems() {
    const cart = RugbyCart.getCart();
    const checkedKeys = new Set(
      Array.from(itemsContainer.querySelectorAll('.item-checkbox:checked')).map(
        (cb) => cb.dataset.id + '|' + cb.dataset.variant
      )
    );
    return cart.filter((item) => checkedKeys.has(item.id + '|' + item.variant));
  }

  function updateTotals() {
    const selected = getSelectedItems();
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
    const checkedBoxes = itemsContainer.querySelectorAll('.item-checkbox:checked');
    selectAllCheckbox.checked =
      allBoxes.length > 0 && checkedBoxes.length === allBoxes.length;
  }

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

  checkoutBtn.addEventListener('click', async () => {
    const selected = getSelectedItems();
    if (selected.length === 0) return;

    // Map cart items to the shape the backend expects
    const cartPayload = selected.map((item) => ({
      name: item.name,
      price: item.price,
      quantity: item.qty,
      variant: item.variant,
    }));

    const originalText = checkoutBtn.textContent;
    checkoutBtn.disabled = true;
    checkoutBtn.textContent = 'Redirecting to payment...';

    try {
      const response = await fetch(CHECKOUT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart: cartPayload }),
      });

      const data = await response.json();

      if (!response.ok || !data.url) {
        throw new Error(data.error || 'Checkout failed');
      }

      window.location.href = data.url; // send to Stripe-hosted payment page
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Something went wrong starting checkout. Please try again.');
      checkoutBtn.disabled = false;
      checkoutBtn.textContent = originalText;
    }
  });

  render();
});