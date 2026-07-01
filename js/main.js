const DATA_STORAGE_KEY = 'imparables_data';
const DEFAULT_DATA = {
  visits: 0,
  links: [
    {
      name: 'Tiktok',
      url: 'https://www.tiktok.com/@imparables_pedro_moncayo',
      image: 'img/items/tiktok_item.png'
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/imparablespedromoncayo/',
      image: 'img/items/instagram_item.png'
    },
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/people/Imparables-Pedro-Moncayo/61591576433954/',
      image: 'img/items/faceook_item.png'
    }
  ]
};

function saveData(data) {
  try {
    localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.warn('No se pudo guardar localStorage', error);
    return false;
  }
}

function loadDataFromStorage() {
  try {
    const raw = localStorage.getItem(DATA_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

async function fetchDataJson() {
  try {
    const response = await fetch('data/links.json');
    if (!response.ok) {
      throw new Error('No se pudo cargar data/links.json');
    }
    return await response.json();
  } catch (error) {
    return null;
  }
}

async function getData() {
  const cached = loadDataFromStorage();
  if (cached && typeof cached === 'object' && Array.isArray(cached.links)) {
    return cached;
  }

  const fetched = await fetchDataJson();
  if (fetched && typeof fetched === 'object' && Array.isArray(fetched.links)) {
    saveData(fetched);
    return fetched;
  }

  saveData(DEFAULT_DATA);
  return DEFAULT_DATA;
}

function renderLinks(links) {
  const list = document.querySelector('.links-list');
  if (!list) {
    return;
  }

  list.innerHTML = '';
  links.forEach((link) => {
    const item = document.createElement('li');
    item.className = 'link-item d-flex align-items-center gap-3 p-3 mb-3';
    item.innerHTML = `
      <a href="${link.url}" target="_blank" rel="noreferrer" class="d-flex align-items-center gap-3 flex-grow-1 w-100 text-decoration-none link-entry">
        <img src="${link.image}" alt="${link.name}" class="item-icon flex-shrink-0">
        <div class="flex-grow-1 text-center link-body">
          <strong class="d-block mb-1">${link.name}</strong>
          <span class="text-muted small">${link.url}</span>
        </div>
      </a>
    `;
    list.appendChild(item);
  });
}

function showMessage(message) {
  const list = document.querySelector('.links-list');
  if (!list) {
    return;
  }
  list.innerHTML = `<li class="text-center text-muted py-4">${message}</li>`;
}

async function loadHtmlComponent(url, targetId) {
  const placeholder = document.getElementById(targetId);
  if (!placeholder) {
    return;
  }
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`No se pudo cargar ${url}`);
    }
    placeholder.innerHTML = await response.text();
  } catch (error) {
    console.warn(error);
  }
}

async function loadComponents() {
  await loadHtmlComponent('header.html', 'site-head');
  await loadHtmlComponent('menu.html', 'site-menu');
  await loadHtmlComponent('footer.html', 'site-footer');
  if (window.location.pathname.endsWith('/nav.html') || window.location.pathname.endsWith('nav.html')) {
    const navButton = document.getElementById('nav-button');
    if (navButton) {
      navButton.style.display = 'none';
    }
  }
}

function incrementVisitCount(data) {
  data.visits = (Number(data.visits) || 0) + 1;
  saveData(data);
  return data.visits;
}

async function initPage() {
  const data = await getData();
  incrementVisitCount(data);

  const list = document.querySelector('.links-list');
  if (list) {
    const links = Array.isArray(data.links) ? data.links : [];
    if (links.length) {
      renderLinks(links);
    } else {
      showMessage('No se encontraron enlaces.');
    }
  }
}

function hideLoader() {
  const loader = document.querySelector('.loader-screen');
  const main = document.querySelector('.main-container');
  if (loader) {
    loader.style.opacity = '0';
    loader.style.pointerEvents = 'none';
    loader.style.visibility = 'hidden';
  }
  if (main) {
    main.classList.add('visible');
  }
}

async function initNavPage() {
  const list = document.querySelector('.links-list');
  if (!list) {
    return;
  }
  showMessage('Cargando enlaces...');
  const links = await getLinks();
  if (Array.isArray(links) && links.length) {
    renderLinks(links);
  } else {
    showMessage('No se encontraron enlaces.');
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  await loadComponents();
  if (document.querySelector('.loader-screen')) {
    setTimeout(hideLoader, 700);
  }
  await initPage();
});
