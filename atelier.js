const gallery = document.querySelector('.gallery');
const photo = gallery.querySelector('#vue');
const original = gallery.querySelector('#vue-originale');
const caption = gallery.querySelector('#legende');

gallery.querySelector('.vues').addEventListener('click', (event) => {
  const link = event.target.closest('a[data-legende]');
  if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  gallery.querySelector('[aria-current="true"]')?.removeAttribute('aria-current');
  link.setAttribute('aria-current', 'true');
  photo.src = link.href;
  photo.alt = link.dataset.alt;
  original.href = link.href;
  original.setAttribute('aria-label', 'Agrandir la photo « ' + link.dataset.legende + ' »');
  caption.textContent = link.dataset.legende;
});
