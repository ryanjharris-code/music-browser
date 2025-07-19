
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
    allMusic = parsed.data.filter(row => row.Genre && row.Band);
      console.log("Loaded rows:", allMusic.length);
      console.log("Sample row:", allMusic[0]);
      console.log("Unique Genres:", [...new Set(allMusic.map(r => r.Genre))]);
      console.log("Unique Bands:", [...new Set(allMusic.map(r => r.Band))]); 
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
    genres.add(item.Genre);
    if (item.Subgenre) subgenres.add(item.Subgenre);
    if (item.Subgenre2) subgenre2s.add(item.Subgenre2);
    bands.add(item.Band);
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
    return (!genre || item.Genre === genre) &&
           (!subgenre || item.Subgenre === subgenre) &&
           (!subgenre2 || item.Subgenre2 === subgenre2) &&
           (!band || item.Band === band);
  });

  musicList.innerHTML = '';
  if (!filtered.length) {
    musicList.innerHTML = '<p>No results found.</p>';
    return;
  }

  filtered.forEach(item => {
    const div = document.createElement('div');
    div.className = 'music-item';
    div.innerHTML = `<strong>${item.Band}</strong><br/>
                     <em>${item.Album || ''}</em><br/>
                     ${item.Genre || ''} > ${item.Subgenre || ''} > ${item.Subgenre2 || ''}<br/>
                     ${item['BAND-LINK'] ? `<a href="${item['BAND-LINK']}" target="_blank"><button>🎧 Band</button></a>` : ''}
                     ${item['BAND+ALBUM-LINK'] ? `<a href="${item['BAND+ALBUM-LINK']}" target="_blank"><button>💿 Album</button></a>` : ''}`;
    musicList.appendChild(div);
  });
}

[genreFilter, subgenreFilter, subgenre2Filter, bandFilter].forEach(filter => {
  filter.addEventListener('input', renderList);
});
