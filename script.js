
const SHEET_URL = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vRrt5k7B5QqOuOrsWrIccUCn0dDRk7ac2nk-zyu9H8wycjdxA5LJMkV-hIkaLmRoB5x2roGxIStyl-1/pub?output=csv'
);

let allMusic = [];
let currentGenre = null;

const content = document.getElementById("content");
const subgenreFilter = document.getElementById("subgenreFilter");
const pageTitle = document.getElementById("pageTitle");
const backHome = document.getElementById("backHome");
const filters = document.getElementById("filters");

fetch(SHEET_URL)
  .then(res => res.text())
  .then(csvText => {
    const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
    allMusic = parsed.data.filter(row => row.genre && row.band);
    route();
  });

function route() {
  const hash = window.location.hash;
  if (hash.startsWith("#genre=")) {
    currentGenre = decodeURIComponent(hash.split("=")[1]);
    showGenrePage(currentGenre);
  } else {
    showHomePage();
  }
}

function showHomePage() {
  pageTitle.textContent = "🎵 Select a Genre";
  backHome.style.display = "none";
  filters.style.display = "none";
  content.innerHTML = "";

  const genres = [...new Set(allMusic.map(m => m.genre))].sort();
  genres.forEach(genre => {
    const btn = document.createElement("button");
    btn.className = "genre-button";
    btn.textContent = genre;
    btn.onclick = () => {
      window.location.hash = `#genre=${encodeURIComponent(genre)}`;
    };
    content.appendChild(btn);
  });
}

function showGenrePage(genre) {
  pageTitle.textContent = `🎶 ${genre}`;
  backHome.style.display = "inline-block";
  filters.style.display = "block";

  const music = allMusic.filter(m => m.genre === genre);
  const subgenres = [...new Set(music.map(m => m.subgenre).filter(Boolean))].sort();

  subgenreFilter.innerHTML = '<option value="">All Subgenres</option>';
  subgenres.forEach(sg => {
    const opt = document.createElement("option");
    opt.value = sg;
    opt.textContent = sg;
    subgenreFilter.appendChild(opt);
  });

  subgenreFilter.onchange = () => {
    renderMusicCards(genre, subgenreFilter.value);
  };

  renderMusicCards(genre, "");
}

function renderMusicCards(genre, subgenre) {
  const music = allMusic.filter(m =>
    m.genre === genre &&
    (!subgenre || m.subgenre === subgenre)
  );

  content.innerHTML = "";
  if (!music.length) {
    content.innerHTML = "<p>No results found.</p>";
    return;
  }

  music.forEach(item => {
    const card = document.createElement("div");
    card.className = "music-card";

    const bandLink = item.bandlink ? `<a href="${item.bandlink}" target="_blank" style="color:#90caf9;">${item.band}</a>` : item.band;
    const albumLink = item.bandalbumlink ? `<a href="${item.bandalbumlink}" target="_blank" style="color:#ffcc80;">${item.album}</a>` : item.album;

    card.innerHTML = `
      <h3>${bandLink}</h3>
      <p><strong>Album:</strong> ${albumLink || ''}</p>
      <p><strong>Year:</strong> ${item.year || ''}</p>
      <p><strong>Era:</strong> ${item.era || ''}</p>
      <p><strong>Tag:</strong> ${item.tag || ''}</p>
    `;
    content.appendChild(card);
  });
}

window.addEventListener("hashchange", route);
