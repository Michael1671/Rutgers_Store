// selection.js — only runs on selection.html.
// Requires cart.js to be loaded first.
// Expects the linking page to pass ?id=...&name=...&price=...&image=...

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const name = params.get('name');
  const price = parseFloat(params.get('price'));
  const image = params.get('image');

  const container = document.getElementById('selection-container');
  const notFound = document.getElementById('selection-notfound');
  const confirmation = document.getElementById('selection-confirmation');
  const confirmationDetail = document.getElementById('confirmation-detail');

  if (!id || !name || !image || isNaN(price)) {
    container.style.display = 'none';
    notFound.style.display = 'block';
    return;
  }

  document.getElementById('selection-name').textContent = name;
  document.getElementById('selection-price').textContent = `$${price.toFixed(2)}`;
  const imageEl = document.getElementById('selection-image');
  imageEl.src = image;
  imageEl.alt = name;

  const sizeGrid = document.getElementById('size-grid');
  const sizeWarning = document.getElementById('size-warning');
  const addBtn = document.getElementById('add-to-cart-btn');

  let selectedSize = null;

  sizeGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('.size_btn');
    if (!btn) return;
    sizeGrid.querySelectorAll('.size_btn').forEach((b) => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedSize = btn.dataset.size;
    sizeWarning.style.display = 'none';
  });

  addBtn.addEventListener('click', () => {
    if (!selectedSize) {
      sizeWarning.style.display = 'block';
      return;
    }

    RugbyCart.addToCart({ id, name, price, image, variant: selectedSize });

    container.style.display = 'none';
    confirmationDetail.textContent = `${name} (Size ${selectedSize})`;
    confirmation.style.display = 'block';
  });
});