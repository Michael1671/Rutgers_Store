const VENMO_ORDER_API_URL = 'https://rutgers-store-backend.vercel.app/api/submit-venmo-order';

document.addEventListener('DOMContentLoaded', () => {
  const cart = JSON.parse(sessionStorage.getItem('venmo_checkout_cart') || '[]');
  const form = document.querySelector('.venmo_form');
  const submitBtn = form.querySelector('.venmo_submit');

  if (cart.length === 0) {
    // Nothing to pay for — send them back to checkout
    window.location.href = 'checkout.html';
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const venmoAccount = document.getElementById('venmo_user').value.trim();
    const name = document.getElementById('order_name').value.trim();

    if (!venmoAccount || !name) {
      alert('Please fill in both your Venmo account and your name.');
      return;
    }

    const originalText = submitBtn.value;
    submitBtn.disabled = true;
    submitBtn.value = 'Submitting order...';

    try {
      const response = await fetch(VENMO_ORDER_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart, venmoAccount, name }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Order submission failed');
      }

      sessionStorage.removeItem('venmo_checkout_cart');
      window.location.href = `success.html?order_id=${data.orderId}`;
    } catch (err) {
      console.error('Venmo order error:', err);
      alert('Something went wrong submitting your order. Please try again.');
      submitBtn.disabled = false;
      submitBtn.value = originalText;
    }
  });
});