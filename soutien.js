// Public hosted-payment links only. Secrets and banking details never belong here.
export function paymentLink(value) {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.hostname !== 'buy.stripe.com' || url.port || url.username || url.password) return null;
    if (!/^\/[A-Za-z0-9]+$/.test(url.pathname)) return null; // reject test links and empty placeholders
    if (url.search || url.hash) return null;
    return url.href;
  } catch { return null; }
}

export function checkoutOptions(config = {}) {
  const support = paymentLink(config?.supportPaymentLink);
  const details = typeof config?.bookDetails === 'string' ? config.bookDetails.trim() : '';
  const book = config?.bookPreorderEnabled === true && details ? paymentLink(config?.bookPaymentLink) : null;
  const allowed = ['Carte bancaire', 'Apple Pay', 'Google Pay', 'PayPal'];
  const methods = Array.isArray(config?.paymentMethods) ? [...new Set(config.paymentMethods.filter(m => allowed.includes(m)))] : [];
  return { support, book, details, methods };
}

export async function initializeSupport(doc = document, request = fetch) {
  try {
    const response = await request('./soutien-config.json', { cache: 'no-store' });
    if (!response.ok) return;
    const options = checkoutOptions(await response.json());
    for (const kind of ['support', 'book']) {
      if (!options[kind]) continue;
      const link = doc.getElementById(`${kind}-pay`);
      link.href = options[kind];
      link.hidden = false;
      doc.getElementById(`${kind}-pending`).hidden = true;
    }
    if (options.book) {
      const details = doc.getElementById('book-details');
      details.textContent = options.details;
      details.hidden = false;
    }
    if (options.support || options.book) {
      doc.getElementById('payment-info').hidden = false;
      const list = doc.getElementById('payment-methods');
      for (const method of options.methods) {
        const item = doc.createElement('li');
        item.textContent = method;
        list.appendChild(item);
      }
    }
  } catch {
    // The truthful opening notices remain visible if payment configuration is unavailable.
  }
}
if (typeof document !== 'undefined') initializeSupport();
