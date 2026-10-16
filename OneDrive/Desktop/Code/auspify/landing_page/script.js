// ===== Mobile Navigation Toggle =====
const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("navMenu");

hamburger.addEventListener("click", () => {
  const isOpen = navMenu.classList.toggle("open");
  hamburger.classList.toggle("active", isOpen);
  hamburger.setAttribute("aria-expanded", isOpen ? "true" : "false");
});

// ===== Loader: count 0–100 in 5 seconds, then hide =====
const loader = document.getElementById("loader");
const loaderProgress = document.getElementById("loaderProgress");

const LOADER_DURATION = 5000; // milliseconds

function hideLoader() {
  loader.classList.add("hide");
}

function renderLoaderProgress(percent) {
  if (loaderProgress) {
    loaderProgress.textContent = `${percent}%`;
  }
}

function startLoaderCounter() {
  const startTime = performance.now();

  const tick = () => {
    const elapsed = performance.now() - startTime;
    const percent = Math.min(100, Math.round((elapsed / LOADER_DURATION) * 100));
    renderLoaderProgress(percent);

    if (percent >= 100) {
      hideLoader();
      return;
    }
    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

startLoaderCounter();

// Close menu when a link is clicked (mobile)
navMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("open");
    hamburger.classList.remove("active");
    hamburger.setAttribute("aria-expanded", "false");
  });
});

// ===== Smooth scroll for sticky navbar offset =====
const nav = document.querySelector(".navbar");
const navHeight = nav.offsetHeight;

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    if (targetId.length > 1) {
      const target = document.querySelector(targetId);
      if (target) {
        event.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }
  });
});
