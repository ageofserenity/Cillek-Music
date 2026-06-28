console.log("Site loaded");

// --- Your tracks (single source of truth) ---
const tracks = [
  { title: "CHILD -ERROR", artist: "My First Story", dur: "4:44", cover: "resources/images/child-error.png", src: "resources/audio/my-first-story-child-error.mp3" },
  { title: "Delusion All", artist: "One Ok Rock", dur: "3:02", cover: "resources/images/one-ok-rock-detox.jpg", src: "resources/audio/delusion-all.mp3"},
  { title: "Track 04", artist: "Artist name", dur: "2:51", cover: "covers/03.jpg", src: "audio/03.mp3" },
  { title: "Track 05", artist: "Artist name", dur: "2:51", cover: "covers/03.jpg", src: "audio/03.mp3" },
  { title: "Track 06", artist: "Artist name", dur: "2:51", cover: "covers/03.jpg", src: "audio/03.mp3" },
  { title: "Track 07", artist: "Artist name", dur: "2:51", cover: "covers/03.jpg", src: "audio/03.mp3" },
  { title: "Track 08", artist: "Artist name", dur: "2:51", cover: "covers/03.jpg", src: "audio/03.mp3" },
];

// --- Grab elements ---
const audio        = document.querySelector(".music-player audio");
const coverEl      = document.querySelector(".player-cover");
const titleEl      = document.querySelector(".player-title");
const artistEl     = document.querySelector(".player-artist");
const toggleBtn    = document.querySelector(".player-toggle");
const progress     = document.querySelector(".progress");
const progressFill = document.querySelector(".progress-fill");
const currentEl    = document.querySelector(".time-current");
const totalEl      = document.querySelector(".time-total");
const listEl       = document.querySelector(".track-list");

let currentIndex = 0;

// --- Build the track list from the data ---
tracks.forEach((t, i) => {
  const li = document.createElement("li");
  li.innerHTML =
    `<button class="track-btn" data-index="${i}">
       <span>${t.title}</span>
       <span class="track-dur">${t.dur}</span>
     </button>`;
  listEl.appendChild(li);
});

// --- Load a track into the player (doesn't auto-play) ---
function loadTrack(i) {
  currentIndex = i;
  const t = tracks[i];
  audio.src = t.src;
  coverEl.src = t.cover;
  titleEl.textContent = t.title;
  artistEl.textContent = t.artist;
  document.querySelectorAll(".track-btn").forEach((b, idx) =>
    b.classList.toggle("active", idx === i)
  );
}

// --- Helper: seconds -> "m:ss" ---
function formatTime(s) {
  if (isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = String(Math.floor(s % 60)).padStart(2, "0");
  return `${m}:${sec}`;
}

// --- Keep the UI in sync with the audio element ---
audio.addEventListener("play",  () => (toggleBtn.textContent = "❚❚"));
audio.addEventListener("pause", () => (toggleBtn.textContent = "▶"));
audio.addEventListener("loadedmetadata", () => (totalEl.textContent = formatTime(audio.duration)));
audio.addEventListener("timeupdate", () => {
  progressFill.style.width = ((audio.currentTime / audio.duration) * 100 || 0) + "%";
  currentEl.textContent = formatTime(audio.currentTime);
});
audio.addEventListener("ended", () => {
  loadTrack((currentIndex + 1) % tracks.length);
  audio.play();
});

// --- Clicks ---
toggleBtn.addEventListener("click", () => (audio.paused ? audio.play() : audio.pause()));

listEl.addEventListener("click", (e) => {
  const btn = e.target.closest(".track-btn");
  if (!btn) return;
  const i = Number(btn.dataset.index);
  if (i === currentIndex && !audio.paused) return audio.pause();
  loadTrack(i);
  audio.play();
});

progress.addEventListener("click", (e) => {
  const rect = progress.getBoundingClientRect();
  audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
});

// --- Load the first track on page load ---
loadTrack(0);
