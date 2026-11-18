import { contact } from './config.js';
import { publishedModels } from './models.js';
import { initStlViewer } from './viewer.js';

const menuButton = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('#main-nav');

function closeMenu() {
  if (!menuButton || !mainNav) return;
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir menú');
  mainNav.classList.remove('open');
}

if (menuButton && mainNav) {
  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Abrir menú' : 'Cerrar menú');
    mainNav.classList.toggle('open', !isOpen);
  });
  mainNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
}

const filterButtons = [...document.querySelectorAll('.filter-button')];
const galleryItems = [...document.querySelectorAll('.gallery-item')];
filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const selected = button.dataset.filter;
    filterButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    galleryItems.forEach((item) => {
      item.hidden = selected !== 'all' && item.dataset.category !== selected;
    });
  });
});

const quoteForm = document.querySelector('#quote-form');
const quoteProduct = document.querySelector('#quote-product');
const formStatus = document.querySelector('#form-status');

document.querySelectorAll('[data-quote]').forEach((button) => {
  button.addEventListener('click', () => {
    const quoteName = button.dataset.quote || '';
    const option = [...quoteProduct.options].find((item) => item.text === quoteName || item.value === quoteName);
    if (option) quoteProduct.value = option.value || option.text;
    else if (quoteName.toLowerCase().includes('toysnoiz 2')) quoteProduct.value = 'Figura personalizada · ToysNoiz 2';
    else if (quoteName.toLowerCase().includes('toysnoiz')) quoteProduct.value = 'Figura personalizada · ToysNoiz';
    else if (quoteName.toLowerCase().includes('funko')) quoteProduct.value = 'Figura personalizada · tipo Funko';
    else if (quoteName.toLowerCase().includes('llavero')) quoteProduct.value = 'Llaveros 3D · venta por menor o mayor';
    else if (quoteName.toLowerCase().includes('recuerdo') || quoteName.toLowerCase().includes('souvenir')) quoteProduct.value = 'Souvenirs o recuerdos';
    else if (quoteName.toLowerCase().includes('mayor')) quoteProduct.value = 'Llaveros 3D · venta por menor o mayor';
    else quoteProduct.value = 'Otro proyecto personalizado';
    document.querySelector('#cotizar').scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => quoteProduct.focus({ preventScroll: true }), 350);
  });
});

if (quoteForm) {
  quoteForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!quoteForm.reportValidity()) return;
    const form = new FormData(quoteForm);
    const lines = [
      'Hola ARTNOIZ, quiero cotizar un proyecto.',
      '',
      'Producto: ' + form.get('product'),
      'Nombre: ' + form.get('name'),
      'Cantidad: ' + form.get('quantity'),
      'Tamaño: ' + (form.get('size') || 'Por definir'),
      'Comuna/ciudad: ' + (form.get('location') || 'Por indicar'),
      '',
      'Detalles: ' + form.get('details'),
      '',
      'Tengo una referencia para enviar por este chat.'
    ];
    const url = 'https://wa.me/' + contact.whatsapp + '?text=' + encodeURIComponent(lines.join('\n'));
    if (formStatus) formStatus.textContent = 'Abriendo WhatsApp con los datos de tu consulta…';
    const opened = window.open('about:blank', '_blank');
    if (opened) {
      opened.opener = null;
      opened.location.replace(url);
    } else {
      window.location.href = url;
    }
  });
}

document.querySelectorAll('.faq-list details').forEach((detail) => {
  detail.addEventListener('toggle', () => {
    const mark = detail.querySelector('summary span');
    if (mark) mark.textContent = detail.open ? '＋' : '＋';
  });
});

initStlViewer({ models: publishedModels });
