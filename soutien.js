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

export function supportAmountCents(value) {
  const match = String(value).trim().match(/^(\d+)(?:[.,](\d{1,2}))?$/);
  if (!match) return null;
  const cents = Number(match[1]) * 100 + Number((match[2] || '').padEnd(2, '0'));
  return Number.isSafeInteger(cents) && cents >= 500 ? cents : null;
}

export function supportPaymentUrl(base, amount) {
  const link = paymentLink(base);
  const cents = supportAmountCents(amount);
  if (!link || cents === null) return null;
  const url = new URL(link);
  // Stripe's documented prefilled_amount is in the price currency's smallest unit.
  url.searchParams.set('prefilled_amount', String(cents));
  return url.href;
}

export function initializeSupportAmount(doc, base) {
  const controls = doc.getElementById('support-amount-options');
  if (!controls) return;
  const input = doc.getElementById('support-amount');
  const error = doc.getElementById('support-amount-error');
  const link = doc.getElementById('support-pay');
  const decrease = doc.getElementById('support-decrease');
  const presets = [...doc.querySelectorAll('[data-support-amount]')];
  const format = new Intl.NumberFormat('fr-FR', {style:'currency',currency:'EUR',minimumFractionDigits:0,maximumFractionDigits:2});
  const update = () => {
    const cents = supportAmountCents(input.value);
    const url = supportPaymentUrl(base, input.value);
    input.setAttribute('aria-invalid', String(!url));
    error.hidden = Boolean(url);
    link.setAttribute('aria-disabled', String(!url));
    if (url) link.href = url;
    else link.removeAttribute('href');
    link.textContent = url ? `Je soutiens à ${format.format(cents / 100)} ↗` : 'Je soutiens le projet ↗';
    decrease.disabled = cents === null || cents <= 500;
    for (const preset of presets) preset.setAttribute('aria-pressed', String(supportAmountCents(preset.dataset.supportAmount) === cents && cents !== null));
  };
  input.addEventListener('input', update);
  for (const preset of presets) preset.addEventListener('click', () => { input.value = preset.dataset.supportAmount; update(); });
  const step = direction => {
    const cents = supportAmountCents(input.value) ?? 500;
    input.value = (Math.max(500, cents + direction * 500) / 100).toFixed(2).replace(/\.00$/, '').replace('.', ',');
    update();
  };
  decrease.addEventListener('click', () => step(-1));
  doc.getElementById('support-increase').addEventListener('click', () => step(1));
  link.addEventListener('click', event => {
    if (supportAmountCents(input.value) === null) { event.preventDefault(); input.focus(); }
  });
  controls.hidden = false;
  update();
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
    if (options.support) initializeSupportAmount(doc, options.support);
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
