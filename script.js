
const SHEET_URL = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vTMB7ETULjxnJTJe45uh10DDfHYKLQAU_vlAixk3NA00blLcmn4vkPvcm1whCbV57lSpF_TkFyQOAKg/pub?gid=1000284919&single=true&output=csv'
);

const musicList = document.getElementById('musicList');
const searchInput = document.getElementById('search');
const genreFilter = document.getElementById('genreFilter');
const artistFilter = document.getElementById('artistFilter');
const eraFilter = document.getElementById('eraFilter');
const typeFilter = document.getElementById('typeFilter');

let allMusic = [];

fetch(SHEET_URL)
  .then(res => res.text())
  .then(csvText => {
    const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
    allMusic = parsed.data.filter(row => row.Artist && row.Genre);
    populateFilters();
    renderList();
  })
  .catch(error => {
    musicList.innerHTML = 'Failed to load music data. Check console for details.';
    console.error('Error loading CSV:', error);
  });

function populateFilters() {
  const genres = new Set();
  const artists = new Set();
  const eras = new Set();
  const types = new Set();
  allMusic.forEach(item => {
    if (item.Genre) genres.add(item.Genre.trim());
    if (item.Artist) artists.add(item.Artist.trim());
    if (item.Era) eras.add(item.Era.trim());
    if (item.Type) types.add(item.Type.trim());
  });
  [[genreFilter, genres], [artistFilter, artists], [eraFilter, eras], [typeFilter, types]]
    .forEach(([filter, set]) => {
      Array.from(set).sort().forEach(val => {
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
           (!search || Object.values(item).some(v => v && v.toLowerCase().includes(search)));
  });

  musicList.innerHTML = '';
  if (filtered.length === 0) {
    musicList.innerHTML = '<p>No results found.</p>';
    return;
  }

  filtered.forEach(item => {
    const div = document.createElement('div');
    div.className = 'music-item';
    div.innerHTML = `<strong>${item.Artist || ''}</strong> — ${item.Type || ''}<br/>
                     <em>${item.Genre || ''}, ${item.Era || ''}</em><br/>
                     ${item.Notes || ''}<br/>
                     ${item.Link ? `<a href="${item.Link}" target="_blank"><button>🎵 Open in YouTube Music</button></a>` : ''}`;
    musicList.appendChild(div);
  });
}

[searchInput, genreFilter, artistFilter, eraFilter, typeFilter].forEach(el => {
  el.addEventListener('input', renderList);
});
