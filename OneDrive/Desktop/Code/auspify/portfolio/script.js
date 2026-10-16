// ===== Mobile Navigation Toggle =====
const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("navMenu");

hamburger.addEventListener("click", () => {
  const isOpen = navMenu.classList.toggle("open");
  hamburger.classList.toggle("active", isOpen);
  hamburger.setAttribute("aria-expanded", isOpen ? "true" : "false");
});

// ===== Loader: hide when the page has fully loaded =====
const loader = document.getElementById("loader");

window.addEventListener("load", () => {
  loader.classList.add("hide");
});

// Fallback in case the load event already fired
if (document.readyState === "complete") {
  loader.classList.add("hide");
}

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

// ===== Highlight the active section in the navigation =====
const sections = document.querySelectorAll("main section[id]");
const navLinks = document.querySelectorAll(".nav-menu a");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
        });
      }
    });
  },
  { rootMargin: "-40% 0px -55% 0px" }
);

sections.forEach((section) => observer.observe(section));

// ===== Contact form =====
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message").value.trim();

  if (!name || !email || !message) {
    showStatus("Please fill in all the fields.", "error");
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showStatus("Please enter a valid email address.", "error");
    return;
  }

  // Static hosting has no backend, so the message is kept in the browser
  // and shown back to the user as a confirmation.
  try {
    const savedMessages = JSON.parse(localStorage.getItem("contactMessages")) || [];
    savedMessages.push({ name, email, message, date: new Date().toISOString() });
    localStorage.setItem("contactMessages", JSON.stringify(savedMessages));
  } catch (error) {
    // Local storage might be unavailable; the form still confirms the message.
  }

  showStatus(`Thank you, ${name}! Your message has been received.`, "success");
  contactForm.reset();
});

function showStatus(text, type) {
  formStatus.textContent = text;
  formStatus.classList.remove("success", "error");
  if (type) {
    formStatus.classList.add(type);
  }
}

// ===== Current year in the footer =====
document.getElementById("year").textContent = new Date().getFullYear();
