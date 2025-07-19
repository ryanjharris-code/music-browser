
const SHEET_URL = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vTMB7ETULjxnJTJe45uh10DDfHYKLQAU_vlAixk3NA00blLcmn4vkPvcm1whCbV57lSpF_TkFyQOAKg/pub?output=csv'
);

const genreFilter = document.getElementById('genreFilter');
const subgenreFilter = document.getElementById('subgenreFilter');
const subgenre2Filter = document.getElementById('subgenre2Filter');
const bandFilter = document.getElementById('bandFilter');
const musicList = document.getElementById('musicList');

let allMusic = [];

fetch(SHEET_URL)
  .then(res => res.text())
  .then(csvText => {
    const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
    allMusic = parsed.data.filter(row => row.genre && row.band);
    populateFilters();
    renderList();
  })
  .catch(error => {
    musicList.innerHTML = 'Failed to load music data.';
    console.error('CSV load error:', error);
  });

function populateFilters() {
  const genres = new Set();
  const subgenres = new Set();
  const subgenre2s = new Set();
  const bands = new Set();
  allMusic.forEach(item => {
    genres.add(item.genre);
    if (item.subgenre) subgenres.add(item.subgenre);
    if (item.subgenre2) subgenre2s.add(item.subgenre2);
    bands.add(item.band);
  });
  [[genreFilter, genres], [subgenreFilter, subgenres], [subgenre2Filter, subgenre2s], [bandFilter, bands]]
    .forEach(([filter, values]) => {
      [...values].sort().forEach(val => {
        const opt = document.createElement('option');
        opt.value = val;
        opt.textContent = val;
        filter.appendChild(opt);
      });
    });
}

function renderList() {
  const genre = genreFilter.value;
  const subgenre = subgenreFilter.value;
  const subgenre2 = subgenre2Filter.value;
  const band = bandFilter.value;

  const filtered = allMusic.filter(item => {
    return (!genre || item.genre === genre) &&
           (!subgenre || item.subgenre === subgenre) &&
           (!subgenre2 || item.subgenre2 === subgenre2) &&
           (!band || item.band === band);
  });

  musicList.innerHTML = '';
  if (!filtered.length) {
    musicList.innerHTML = '<p>No results found.</p>';
    return;
  }

  filtered.forEach(item => {
    const div = document.createElement('div');
    div.className = 'music-item';
    div.innerHTML = `<strong>${item.band}</strong><br/>
                     <em>${item.album || ''}</em><br/>
                     ${item.genre || ''} > ${item.subgenre || ''} > ${item.subgenre2 || ''}<br/>
                     ${item.bandlink ? `<a href="${item.bandlink}" target="_blank"><button>🎧 Band</button></a>` : ''}
                     ${item.bandalbumlink ? `<a href="${item.bandalbumlink}" target="_blank"><button>💿 Album</button></a>` : ''}`;
    musicList.appendChild(div);
  });
}

[genreFilter, subgenreFilter, subgenre2Filter, bandFilter].forEach(filter => {
  if (filter) {
    filter.addEventListener('input', renderList);
  }
});
