
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTMB7ETULjxnJTJe45uh10DDfHYKLQAU_vlAixk3NA00blLcmn4vkPvcm1whCbV57lSpF_TkFyQOAKg/pub?gid=1000284919&single=true&output=csv';
const SHEET_URL = 'https://corsproxy.io/?https://docs.google.com/spreadsheets/d/e/2PACX-1vTMB7ETULjxnJTJe45uh10DDfHYKLQAU_vlAixk3NA00blLcmn4vkPvcm1whCbV57lSpF_TkFyQOAKg/pub?gid=1000284919&single=true&output=csv';

const musicList = document.getElementById('musicList');
const searchInput = document.getElementById('search');
const genreFilter = document.getElementById('genreFilter');
const artistFilter = document.getElementById('artistFilter');
const eraFilter = document.getElementById('eraFilter');
const typeFilter = document.getElementById('typeFilter');

let allMusic = [];

fetch(SHEET_URL)
  .then(res => res.text())
  .then(data => {
    const rows = data.split('\n').map(row => row.split(','));
    const headers = rows.shift();
    allMusic = rows.map(row => Object.fromEntries(row.map((val, i) => [headers[i], val])));
    populateFilters();
    renderList();
  });

function populateFilters() {
  const genres = new Set();
  const artists = new Set();
  const eras = new Set();
  const types = new Set();
  allMusic.forEach(item => {
    genres.add(item.Genre);
    artists.add(item.Artist);
    eras.add(item.Era);
    types.add(item.Type);
  });
  [genreFilter, genres], [artistFilter, artists], [eraFilter, eras], [typeFilter, types]
    .forEach(([filter, set]) => {
      set.forEach(val => {
        const option = document.createElement('option');
        option.value = val;
        option.textContent = val;
        filter.appendChild(option);
      });
    });
}

function renderList() {
  const search = searchInput.value.toLowerCase();
  const genre = genreFilter.value;
  const artist = artistFilter.value;
  const era = eraFilter.value;
  const type = typeFilter.value;

  const filtered = allMusic.filter(item => {
    return (!genre || item.Genre === genre) &&
           (!artist || item.Artist === artist) &&
           (!era || item.Era === era) &&
           (!type || item.Type === type) &&
           (!search || Object.values(item).some(v => v.toLowerCase().includes(search)));
  });

  musicList.innerHTML = '';
  filtered.forEach(item => {
    const div = document.createElement('div');
    div.className = 'music-item';
    div.innerHTML = `<strong>${item.Artist}</strong> — ${item.Type}<br/>
                     <em>${item.Genre}, ${item.Era}</em><br/>
                     ${item.Notes || ''}<br/>
                     ${item.Link ? `<a href="${item.Link}" target="_blank"><button>🎵 Open in YouTube Music</button></a>` : ''}`;
    musicList.appendChild(div);
  });
}

[searchInput, genreFilter, artistFilter, eraFilter, typeFilter].forEach(el => {
  el.addEventListener('input', renderList);
});
