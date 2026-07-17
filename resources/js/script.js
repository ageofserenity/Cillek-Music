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


// --- Scroll reveal (fade-in-up as sections enter view) ---
const revealEls = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
setTimeout(() => {
  revealEls.forEach((el) => revealObserver.observe(el));
}, 3500);


// --- Intro effect: waveform beat-pulse that settles into the background ---
window.addEventListener("load", function () {
  const canvas = document.createElement("canvas");
  Object.assign(canvas.style, { position: "fixed", inset: "0", width: "100%", height: "100%", zIndex: "10000", pointerEvents: "none", transition: "opacity 0.9s ease" });
  document.body.appendChild(canvas);
  document.body.style.overflow = "hidden";
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  let W, H;
  function resize() { W = canvas.width = window.innerWidth * dpr; H = canvas.height = window.innerHeight * dpr; }
  resize();
  window.addEventListener("resize", resize);
  const PINK = "236,121,159";
  const start = performance.now();
  const DURATION = 2600;
  const beats = [
    [300, 1.0],
    [750, 0.4],
    [1150, 1.0],
    [1550, 0.35],
    [1950, 1.0]
  ];
  function envelope(t) {
    let v = 0.12;
    for (let i = 0; i < beats.length; i++) {
      const bt = beats[i][0], strength = beats[i][1];
      if (t >= bt) {
        const decay = Math.exp(-(t - bt) / 220);
        v = Math.max(v, strength * decay);
      }
    }
    return v;
  }
  const BAR_W = 1 * dpr;
  const GAP = 5 * dpr;
  function draw(now) {
    const t = now - start;
    ctx.fillStyle = "#1F1D1C";
    ctx.fillRect(0, 0, W, H);
    const level = envelope(t);
    const midY = H / 2;
    const step = BAR_W + GAP;
    const count = Math.ceil(W / step);
    for (let i = 0; i < count; i++) {
      const x = i * step;
      const variance = 0.4 + 0.6 * Math.abs(Math.sin(i * 0.35));
      const jitter = 0.85 + Math.random() * 0.3;
      const h = level * variance * jitter * (H * 0.42);
      ctx.fillStyle = "rgba(" + PINK + "," + (0.35 + level * 0.5) + ")";
      ctx.fillRect(x, midY - h, BAR_W, h * 2);
    }
    if (t < DURATION) { requestAnimationFrame(draw); }
    else { canvas.style.opacity = "0"; setTimeout(function () { canvas.remove(); document.body.style.overflow = ""; }, 900); }
  }
  requestAnimationFrame(draw);
});