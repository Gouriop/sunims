/**
 * Suni Jose &bull; Dark Editorial Hero Application
 */

const DEFAULT_PHOTO = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1600";

const DEFAULT_LINKS = [
  { id: "1", title: "KTU Academic Portal", url: "https://ktu.edu.in", isPrimary: true },
  { id: "2", title: "CSBS Syllabus & Scheme", url: "https://ktu.edu.in/eu/acd/academicRegulationSys.htm", isPrimary: false },
  { id: "3", title: "Course Notes & Lab", url: "https://cce.edu.in", isPrimary: false },
  { id: "4", title: "Christ College of Engineering", url: "https://cce.edu.in", isPrimary: false }
];

let links = [];
let heroPhoto = "";

document.addEventListener("DOMContentLoaded", () => {
  loadData();
  setupEvents();
  render();
});

function loadData() {
  try {
    const savedPhoto = localStorage.getItem("suni_hero_photo");
    heroPhoto = savedPhoto || DEFAULT_PHOTO;

    const savedLinks = localStorage.getItem("suni_hero_links_v1");
    links = savedLinks ? JSON.parse(savedLinks) : [...DEFAULT_LINKS];
  } catch (e) {
    heroPhoto = DEFAULT_PHOTO;
    links = [...DEFAULT_LINKS];
  }
}

function saveLinks() {
  localStorage.setItem("suni_hero_links_v1", JSON.stringify(links));
}

function savePhoto(url) {
  heroPhoto = url;
  localStorage.setItem("suni_hero_photo", url);
  document.getElementById("photoContainer").style.backgroundImage = `url('${url}')`;
}

function render() {
  // Render Photo on Right
  document.getElementById("photoContainer").style.backgroundImage = `url('${heroPhoto}')`;

  // Render Links
  renderLinks();
}

function renderLinks() {
  const container = document.getElementById("linksGrid");
  container.innerHTML = "";

  links.forEach((item, index) => {
    const wrap = document.createElement("div");
    wrap.className = "link-pill-wrapper";

    const btnClass = item.isPrimary ? "btn btn-orange" : "btn btn-outline";
    const fullUrl = ensureUrl(item.url);

    wrap.innerHTML = `
      <a href="${fullUrl}" target="_blank" rel="noopener noreferrer" class="${btnClass}">
        ${escapeHtml(item.title)}
      </a>
      <button class="delete-btn-badge" title="Remove Link" data-index="${index}">&times;</button>
    `;

    wrap.querySelector(".delete-btn-badge").addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (confirm(`Remove link: "${item.title}"?`)) {
        links.splice(index, 1);
        saveLinks();
        renderLinks();
        showToast("Link removed");
      }
    });

    container.appendChild(wrap);
  });
}

function setupEvents() {
  // Photo Upload
  const uploadPhotoBtn = document.getElementById("uploadPhotoBtn");
  const photoFileInput = document.getElementById("photoFileInput");

  uploadPhotoBtn.addEventListener("click", () => {
    photoFileInput.click();
  });

  photoFileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        showToast("Please choose a valid image file");
        return;
      }
      const reader = new FileReader();
      reader.onload = (evt) => {
        savePhoto(evt.target.result);
        showToast("Photo updated successfully!");
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    }
  });

  // Add Link Modal
  const addLinkModal = document.getElementById("addLinkModal");
  const addLinkBtn = document.getElementById("addLinkBtn");
  const closeAddLink = document.getElementById("closeAddLink");
  const cancelAddLink = document.getElementById("cancelAddLink");
  const addLinkForm = document.getElementById("addLinkForm");

  addLinkBtn.addEventListener("click", () => {
    document.getElementById("linkTitleInput").value = "";
    document.getElementById("linkUrlInput").value = "";
    document.getElementById("linkIsPrimary").checked = false;
    addLinkModal.classList.add("open");
    setTimeout(() => document.getElementById("linkTitleInput").focus(), 80);
  });

  closeAddLink.addEventListener("click", () => addLinkModal.classList.remove("open"));
  cancelAddLink.addEventListener("click", () => addLinkModal.classList.remove("open"));

  addLinkModal.addEventListener("click", (e) => {
    if (e.target === addLinkModal) addLinkModal.classList.remove("open");
  });

  addLinkForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("linkTitleInput").value.trim();
    const url = document.getElementById("linkUrlInput").value.trim();
    const isPrimary = document.getElementById("linkIsPrimary").checked;

    if (title && url) {
      links.push({
        id: Date.now().toString(),
        title,
        url,
        isPrimary
      });
      saveLinks();
      renderLinks();
      addLinkModal.classList.remove("open");
      showToast("Link added successfully!");
    }
  });

  // Escape to close
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      addLinkModal.classList.remove("open");
    }
  });
}

function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.style.display = "block";
  setTimeout(() => {
    t.style.display = "none";
  }, 2200);
}

function ensureUrl(url) {
  if (!url) return "#";
  if (!/^https?:\/\//i.test(url)) return "https://" + url;
  return url;
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
