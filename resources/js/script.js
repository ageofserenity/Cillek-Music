console.log("Site loaded");

// --- Contact overlay ---
const contactBtn = document.getElementById("contactBtn");
const contactOverlay = document.getElementById("contactOverlay");
const contactClose = document.getElementById("contactClose");
const contactForm = document.querySelector(".contact-form");

contactBtn.addEventListener("click", (e) => {
  e.preventDefault();
  contactOverlay.style.display = "flex";
});

contactClose.addEventListener("click", () => {
  contactOverlay.style.display = "none";
  resetForm();
});

contactOverlay.addEventListener("click", (e) => {
  if (e.target === contactOverlay) {
    contactOverlay.style.display = "none";
    resetForm();
  }
});

contactForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const submitBtn = contactForm.querySelector("button[type='submit']");
  submitBtn.textContent = "Sending...";
  submitBtn.disabled = true;

  try {
    const res = await fetch(contactForm.action, {
      method: "POST",
      body: new FormData(contactForm),
      headers: { "Accept": "application/json" }
    });

    if (res.ok) {
      contactForm.innerHTML = '<p class="form-success">Message sent! We\'ll get back to you soon.</p>';
    } else {
      submitBtn.textContent = "Send";
      submitBtn.disabled = false;
      alert("Something went wrong. Please try again.");
    }
  } catch {
    submitBtn.textContent = "Send";
    submitBtn.disabled = false;
    alert("Something went wrong. Please try again.");
  }
});

function resetForm() {
  const success = contactForm.querySelector(".form-success");
  if (success) {
    contactForm.innerHTML = `
      <input type="text" name="name" placeholder="Name" required>
      <input type="email" name="email" placeholder="Email" required>
      <input type="text" name="subject" placeholder="Subject" required>
      <textarea name="message" placeholder="Message" rows="5" required></textarea>
      <button type="submit" class="btn btn-primary">Send</button>
    `;
  }
}


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

document.querySelectorAll('*').forEach(el => {
  if (el.offsetWidth > document.documentElement.clientWidth) {
    console.log('Overflowing element:', el);
    el.style.outline = '2px solid red';
  }
});