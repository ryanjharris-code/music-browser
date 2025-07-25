
let filterStack = [];

async function loadCSV() {
  const response = await fetch(CSV_URL);
  const data = await response.text();
  const rows = data.split('\n').map(row => row.split(','));

  const headers = rows[0].map(h => h.trim().toLowerCase());
  const items = rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = (row[i] || '').trim();
    });
    return obj;
  }).filter(item => item.genre && item.band);

  const homeButtons = document.getElementById('home-buttons');
  const filterButtons = document.getElementById('filter-buttons');
  const subgenreButtons = document.getElementById('subgenre-buttons');
  const subgenre2Buttons = document.getElementById('subgenre2-buttons');
  const results = document.getElementById('results');

  const eras = [...new Set(items.map(i => i.era))].filter(Boolean).sort();

  function clearAll() {
    filterButtons.innerHTML = '';
    subgenreButtons.innerHTML = '';
    subgenre2Buttons.innerHTML = '';
    results.innerHTML = '';
  }

  function displayItems(data) {
    results.innerHTML = '';
    data.sort((a, b) => a.band.localeCompare(b.band)).forEach(item => {
      const div = document.createElement('div');
      div.className = 'result-item';
      div.innerHTML = `
        <p><strong><a href="${item.bandlink}" target="_blank">${item.band}</a></strong></p>
        <p class="year-line"><a href="${item.bandalbumlink}" target="_blank">${item.album}</a> ${item.year}</p>
        <div class="meta-line">
          <span>${item.tag}</span>
          <span>${item.era}</span>
        </div>
      `;
      results.appendChild(div);
    });
  }

  function setupGenreFlow(filteredItems) {
    homeButtons.innerHTML = '';
    const activeGenres = [...new Set(filteredItems.map(i => i.genre))].sort();
    activeGenres.forEach(genre => {
      const btn = document.createElement('button');
      btn.textContent = genre;
      btn.onclick = () => {
        filterStack.push(() => setupGenreFlow(filteredItems));
        subgenreButtons.innerHTML = '';
        subgenre2Buttons.innerHTML = '';
        const genreItems = filteredItems.filter(i => i.genre === genre);
        const subgenres = [...new Set(genreItems.map(i => i.subgenre))].filter(Boolean).sort();
        subgenres.forEach(sub => {
          const sbtn = document.createElement('button');
          sbtn.textContent = sub;
          sbtn.onclick = () => {
            filterStack.push(() => displayItems(genreItems));
            const subItems = genreItems.filter(i => i.subgenre === sub);
            const subgenre2s = [...new Set(subItems.map(i => i.subgenre2))].filter(Boolean).sort();
            subgenre2Buttons.innerHTML = '';
            subgenre2s.forEach(s2 => {
              const s2btn = document.createElement('button');
              s2btn.textContent = s2;
              s2btn.onclick = () => {
                filterStack.push(() => displayItems(subItems));
                const final = subItems.filter(i => i.subgenre2 === s2);
                displayItems(final);
              };
              subgenre2Buttons.appendChild(s2btn);
            });
            displayItems(subItems);
          };
          subgenreButtons.appendChild(sbtn);
        });
        displayItems(genreItems);
      };
      homeButtons.appendChild(btn);
    });
  }

  eras.forEach(era => {
    const ebtn = document.createElement('button');
    ebtn.textContent = era;
    ebtn.onclick = () => {
      clearAll();
      const eraItems = items.filter(i => i.era === era);
      filterStack.push(() => setupGenreFlow(items));
      setupGenreFlow(eraItems);
    };
    filterButtons.appendChild(ebtn);
  });

  setupGenreFlow(items);
}

function goBack() {
  if (filterStack.length > 0) {
    const lastFn = filterStack.pop();
    if (typeof lastFn === 'function') lastFn();
  }
}

loadCSV();
