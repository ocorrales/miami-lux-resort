/* =============================================
   PARADISE HOUSE MIAMI — main.js
   ============================================= */

/* -------------------------------------------
   CONFIG — Update these values
   ------------------------------------------- */
const CONFIG = {
  // Replace with the real WhatsApp number (digits only, with country code)
  // Example: "13055550123" for a Miami number
  whatsappNumber: "17864448446",
  whatsappMessage: "Hi! I'm interested in booking Paradise House Miami. Can you share availability and pricing? 🌴",
};

/* -------------------------------------------
   WhatsApp links
   ------------------------------------------- */
function buildWhatsAppUrl() {
  const num = CONFIG.whatsappNumber.replace(/\D/g, "");
  const msg = encodeURIComponent(CONFIG.whatsappMessage);
  return `https://wa.me/${num}?text=${msg}`;
}

document.querySelectorAll(".whatsapp-link").forEach((el) => {
  el.href = buildWhatsAppUrl();
});

/* -------------------------------------------
   Navigation — scroll effect + burger
   ------------------------------------------- */
const nav      = document.getElementById("nav");
const burger   = document.getElementById("navBurger");
const drawer   = document.getElementById("navDrawer");

window.addEventListener("scroll", () => {
  nav.classList.toggle("is-scrolled", window.scrollY > 60);
}, { passive: true });

burger.addEventListener("click", () => {
  const isOpen = drawer.classList.toggle("open");
  burger.classList.toggle("open", isOpen);
  burger.setAttribute("aria-expanded", isOpen);
  drawer.setAttribute("aria-hidden", !isOpen);
});

// Close drawer on link click
drawer.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    drawer.classList.remove("open");
    burger.classList.remove("open");
    burger.setAttribute("aria-expanded", false);
    drawer.setAttribute("aria-hidden", true);
  });
});

/* -------------------------------------------
   Smooth scroll (offset for fixed nav)
   ------------------------------------------- */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (e) => {
    const id = anchor.getAttribute("href");
    if (id === "#") return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const offset = 76;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
  });
});

/* -------------------------------------------
   Scroll reveal (Intersection Observer)
   ------------------------------------------- */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
);

document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

/* -------------------------------------------
   Hero BG — trigger scale-in on load
   ------------------------------------------- */
const heroBg = document.getElementById("heroBg");
if (heroBg) {
  window.addEventListener("load", () => heroBg.classList.add("loaded"), { once: true });
}

/* -------------------------------------------
   Gallery Lightbox
   ------------------------------------------- */
const galleryItems = Array.from(document.querySelectorAll(".gallery__item"));
const lightbox     = document.getElementById("lightbox");
const lbClose      = document.getElementById("lightboxClose");
const lbPrev       = document.getElementById("lightboxPrev");
const lbNext       = document.getElementById("lightboxNext");
const lbImg        = document.getElementById("lightboxImg");
const lbPlaceholder = document.getElementById("lightboxPlaceholder");
const lbCaption    = document.getElementById("lightboxCaption");

let currentIndex = 0;

// Gather data from each gallery item
const galleryData = galleryItems.map((item) => {
  const imgEl   = item.querySelector(".gallery__img");
  const label   = item.dataset.label || "";
  const bgStyle = imgEl ? getComputedStyle(imgEl).backgroundImage : "";
  // Extract the image URL if it exists (not gradient)
  const urlMatch = bgStyle.match(/url\(["']?([^"')]+)["']?\)/g);
  let imgSrc = null;
  if (urlMatch) {
    for (const u of urlMatch) {
      const src = u.replace(/url\(["']?/, "").replace(/["']?\)$/, "");
      if (!src.includes("data:") && !src.includes("gradient")) {
        imgSrc = src;
        break;
      }
    }
  }
  // Get the gradient string for placeholder fallback
  const grad = imgEl ? imgEl.style.getPropertyValue("--grad") : "";
  return { label, imgSrc, grad };
});

function openLightbox(index) {
  currentIndex = index;
  const data = galleryData[index];

  if (data.imgSrc) {
    lbImg.src = data.imgSrc;
    lbImg.alt = data.label;
    lbImg.style.display = "block";
    lbPlaceholder.style.display = "none";
  } else {
    lbImg.style.display = "none";
    lbPlaceholder.style.display = "flex";
    lbPlaceholder.style.background = data.grad || "#0d1b2a";
    // Show an emoji based on label
    const emojiMap = {
      "Main House": "🏠", "Pool Area": "🏊", "Game Room": "🎱",
      "Pickleball Court": "🏓", "Outdoor & Fire Pit": "🔥", "Mini Golf": "⛳",
    };
    lbPlaceholder.textContent = emojiMap[data.label] || "🌴";
  }

  lbCaption.textContent = data.label;
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  lbClose.focus();
}

function closeLightbox() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function navigate(dir) {
  currentIndex = (currentIndex + dir + galleryItems.length) % galleryItems.length;
  openLightbox(currentIndex);
}

galleryItems.forEach((item, i) => {
  item.addEventListener("click", () => openLightbox(i));
  item.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLightbox(i); }
  });
  item.setAttribute("tabindex", "0");
  item.setAttribute("role", "button");
  item.setAttribute("aria-label", `View ${item.dataset.label}`);
});

lbClose.addEventListener("click", closeLightbox);
lbPrev.addEventListener("click", () => navigate(-1));
lbNext.addEventListener("click", () => navigate(1));

lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener("keydown", (e) => {
  if (!lightbox.classList.contains("open")) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft")  navigate(-1);
  if (e.key === "ArrowRight") navigate(1);
});

/* -------------------------------------------
   Active nav link on scroll
   ------------------------------------------- */
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav__links a, .nav__drawer a");

const sectionObserver = new IntersectionObserver(
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
  { rootMargin: "-30% 0px -60% 0px" }
);

sections.forEach((s) => sectionObserver.observe(s));
