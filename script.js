const galleryEl = document.querySelector("#gallery");
const statusEl = document.querySelector("#galleryStatus");
const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightboxImage");
const closeButtons = document.querySelectorAll("[data-close-lightbox]");
const prevButton = document.querySelector("[data-lightbox-prev]");
const nextButton = document.querySelector("[data-lightbox-next]");

let galleryItems = [];
let activeIndex = 0;
let lastFocusedElement = null;
let touchStartX = 0;
let touchStartY = 0;

function getImageAlt(item) {
  return item.alt || item.title || "MMAREL portfolio artwork";
}

function buildGallery(items) {
  const fragment = document.createDocumentFragment();

  items.forEach((item, index) => {
    const button = document.createElement("button");
    button.className = "gallery-card";
    button.type = "button";
    button.setAttribute("aria-label", `Open ${getImageAlt(item)}`);

    const img = document.createElement("img");
    img.src = item.src;
    img.alt = getImageAlt(item);
    img.loading = "lazy";
    img.decoding = "async";

    if (item.width) {
      img.width = item.width;
    }

    if (item.height) {
      img.height = item.height;
    }

    img.addEventListener("load", () => button.classList.add("loaded"), { once: true });
    img.addEventListener("error", () => button.classList.add("loaded"), { once: true });

    button.append(img);
    button.addEventListener("click", () => openLightbox(index));
    fragment.append(button);
  });

  galleryEl.replaceChildren(fragment);
}

function openLightbox(index) {
  activeIndex = index;
  lastFocusedElement = document.activeElement;
  updateLightboxImage();
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("lightbox-lock");
  closeButtons[0].focus();
}

function closeLightbox() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("lightbox-lock");
  lightboxImage.removeAttribute("src");

  if (lastFocusedElement) {
    lastFocusedElement.focus();
  }
}

function updateLightboxImage() {
  const item = galleryItems[activeIndex];
  lightboxImage.src = item.src;
  lightboxImage.alt = getImageAlt(item);
}

function showImage(direction) {
  if (!galleryItems.length) {
    return;
  }

  activeIndex = (activeIndex + direction + galleryItems.length) % galleryItems.length;
  updateLightboxImage();
}

function handleKeyboard(event) {
  if (!lightbox.classList.contains("open")) {
    return;
  }

  if (event.key === "Escape") {
    closeLightbox();
  }

  if (event.key === "ArrowRight") {
    showImage(1);
  }

  if (event.key === "ArrowLeft") {
    showImage(-1);
  }
}

function handleTouchStart(event) {
  if (!lightbox.classList.contains("open")) {
    return;
  }

  const touch = event.changedTouches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
}

function handleTouchEnd(event) {
  if (!lightbox.classList.contains("open")) {
    return;
  }

  const touch = event.changedTouches[0];
  const deltaX = touch.clientX - touchStartX;
  const deltaY = touch.clientY - touchStartY;

  if (Math.abs(deltaX) < 50 || Math.abs(deltaX) < Math.abs(deltaY)) {
    return;
  }

  showImage(deltaX < 0 ? 1 : -1);
}

async function loadGallery() {
  try {
    const response = await fetch("gallery.json");

    if (!response.ok) {
      throw new Error(`Gallery request failed: ${response.status}`);
    }

    galleryItems = await response.json();
    buildGallery(galleryItems);
    statusEl.hidden = true;
  } catch (error) {
    statusEl.textContent = "Gallery unavailable";
    console.error(error);
  }
}

closeButtons.forEach((button) => {
  button.addEventListener("click", closeLightbox);
});

prevButton.addEventListener("click", () => showImage(-1));
nextButton.addEventListener("click", () => showImage(1));
document.addEventListener("keydown", handleKeyboard);
lightbox.addEventListener("touchstart", handleTouchStart, { passive: true });
lightbox.addEventListener("touchend", handleTouchEnd, { passive: true });

loadGallery();
