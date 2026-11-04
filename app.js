/**
 * Suni Jose &bull; Dark Editorial Hero Application
 * Theme: Peacock Green & White
 * Passcode: sunikkutty123
 */

const PASSWORD_KEY = "sunikkutty123";

const DEFAULT_PHOTO = "sunimiss.png";

const DEFAULT_DETAILS = {
  nameFirst: "SUNI",
  nameLast: "JOSE",
  eyebrow: "THRISSUR • CHRIST COLLEGE OF ENGINEERING",
  locationUrl: "https://share.google/w9Lan5VydQo54Kk9G",
  role: "Assistant Professor • Computer Science & Business Systems",
  desc: "Department of Computer Science & Business Systems at Christ College of Engineering. Curating curriculum, research papers, lecture notes, and student resources.",
  phone: "7994532402",
  email: "sunijose.cs@cce.edu.in"
};

const DEFAULT_LINKS = [
  { id: "1", title: "Christ College of Engineering", url: "https://cce.edu.in", isPrimary: true }
];

const STORAGE_LINKS_KEY = "suni_hero_links_v6";
const STORAGE_DETAILS_KEY = "suni_profile_details_v6";
const STORAGE_PHOTO_KEY = "suni_hero_photo_v6";
const STORAGE_AUTH_KEY = "suni_auth_session_v6";

let links = [];
let heroPhoto = "";
let profileDetails = {};
let isAuthenticated = false;

document.addEventListener("DOMContentLoaded", () => {
  loadData();
  setupEvents();
  render();
});

function loadData() {
  try {
    const savedPhoto = localStorage.getItem(STORAGE_PHOTO_KEY);
    heroPhoto = (savedPhoto && !savedPhoto.includes("unsplash")) ? savedPhoto : DEFAULT_PHOTO;

    const savedLinks = localStorage.getItem(STORAGE_LINKS_KEY);
    links = savedLinks ? JSON.parse(savedLinks) : [...DEFAULT_LINKS];

    const savedDetails = localStorage.getItem(STORAGE_DETAILS_KEY);
    profileDetails = savedDetails ? JSON.parse(savedDetails) : { ...DEFAULT_DETAILS };

    isAuthenticated = localStorage.getItem(STORAGE_AUTH_KEY) === "true";
  } catch (e) {
    heroPhoto = DEFAULT_PHOTO;
    links = [...DEFAULT_LINKS];
    profileDetails = { ...DEFAULT_DETAILS };
    isAuthenticated = false;
  }
}

function saveLinks() {
  localStorage.setItem(STORAGE_LINKS_KEY, JSON.stringify(links));
}

function saveDetails() {
  localStorage.setItem(STORAGE_DETAILS_KEY, JSON.stringify(profileDetails));
}

function savePhoto(url) {
  heroPhoto = url;
  localStorage.setItem(STORAGE_PHOTO_KEY, url);
  document.getElementById("photoContainer").style.backgroundImage = `url('${url}')`;
}

// =============================================================================
// Rendering
// =============================================================================

function render() {
  // Render Photo on Right
  document.getElementById("photoContainer").style.backgroundImage = `url('${heroPhoto}')`;

  // Render Details
  document.getElementById("eyebrowText").textContent = profileDetails.eyebrow || DEFAULT_DETAILS.eyebrow;
  const locEl = document.getElementById("locationLink");
  if (locEl) {
    locEl.href = profileDetails.locationUrl || DEFAULT_DETAILS.locationUrl;
  }
  document.getElementById("nameFirst").textContent = profileDetails.nameFirst || DEFAULT_DETAILS.nameFirst;
  document.getElementById("nameLast").textContent = profileDetails.nameLast || DEFAULT_DETAILS.nameLast;
  document.getElementById("heroRole").textContent = profileDetails.role || DEFAULT_DETAILS.role;
  document.getElementById("heroDesc").textContent = profileDetails.desc || DEFAULT_DETAILS.desc;

  const phoneEl = document.getElementById("contactPhone");
  if (profileDetails.phone) {
    phoneEl.href = `tel:${profileDetails.phone}`;
    phoneEl.querySelector("span").textContent = profileDetails.phone;
    phoneEl.style.display = "inline-flex";
  } else {
    phoneEl.style.display = "none";
  }

  const emailEl = document.getElementById("contactEmail");
  if (profileDetails.email) {
    emailEl.href = `mailto:${profileDetails.email}`;
    emailEl.querySelector("span").textContent = profileDetails.email;
    emailEl.style.display = "inline-flex";
  } else {
    emailEl.style.display = "none";
  }

  // Auth UI controls
  const loginBtn = document.getElementById("loginBtn");
  const loggedInControls = document.getElementById("loggedInControls");
  const addLinkBtn = document.getElementById("addLinkBtn");
  const uploadPhotoBtn = document.getElementById("uploadPhotoBtn");

  if (isAuthenticated) {
    loginBtn.style.display = "none";
    loggedInControls.style.display = "flex";
    addLinkBtn.style.display = "inline-flex";
    uploadPhotoBtn.style.display = "inline-flex";
  } else {
    loginBtn.style.display = "inline-flex";
    loggedInControls.style.display = "none";
    addLinkBtn.style.display = "none";
    uploadPhotoBtn.style.display = "none";
  }

  // Render Links
  renderLinks();
}

function renderLinks() {
  const container = document.getElementById("linksGrid");
  container.innerHTML = "";

  links.forEach((item, index) => {
    const wrap = document.createElement("div");
    wrap.className = "link-pill-wrapper";

    const btnClass = item.isPrimary ? "btn btn-peacock" : "btn btn-outline";
    const fullUrl = ensureUrl(item.url);

    wrap.innerHTML = `
      <a href="${fullUrl}" target="_blank" rel="noopener noreferrer" class="${btnClass}">
        ${escapeHtml(item.title)}
      </a>
      ${isAuthenticated ? `
        <button class="delete-btn-badge" title="Remove Link" data-index="${index}">&times;</button>
      ` : ""}
    `;

    if (isAuthenticated) {
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
    }

    container.appendChild(wrap);
  });
}

// =============================================================================
// Event Handlers
// =============================================================================

function setupEvents() {
  // Login Modal
  const loginModal = document.getElementById("loginModal");
  const loginBtn = document.getElementById("loginBtn");
  const closeLoginModal = document.getElementById("closeLoginModal");
  const cancelLogin = document.getElementById("cancelLogin");
  const loginForm = document.getElementById("loginForm");
  const loginPassword = document.getElementById("loginPassword");
  const loginError = document.getElementById("loginError");
  const togglePasswordBtn = document.getElementById("togglePasswordBtn");
  const eyeIcon = document.getElementById("eyeIcon");

  loginBtn.addEventListener("click", () => {
    loginPassword.value = "";
    loginError.style.display = "none";
    loginModal.classList.add("open");
    setTimeout(() => loginPassword.focus(), 80);
  });

  closeLoginModal.addEventListener("click", () => loginModal.classList.remove("open"));
  cancelLogin.addEventListener("click", () => loginModal.classList.remove("open"));

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const entered = loginPassword.value.trim();
    if (entered === PASSWORD_KEY) {
      isAuthenticated = true;
      localStorage.setItem(STORAGE_AUTH_KEY, "true");
      loginModal.classList.remove("open");
      render();
      showToast("Welcome back! Editor mode unlocked.");
    } else {
      loginError.style.display = "block";
      loginPassword.focus();
      loginPassword.select();
    }
  });

  togglePasswordBtn.addEventListener("click", () => {
    if (loginPassword.type === "password") {
      loginPassword.type = "text";
      eyeIcon.innerHTML = `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>`;
    } else {
      loginPassword.type = "password";
      eyeIcon.innerHTML = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>`;
    }
  });

  // Logout
  document.getElementById("logoutBtn").addEventListener("click", () => {
    isAuthenticated = false;
    localStorage.setItem(STORAGE_AUTH_KEY, "false");
    render();
    showToast("Logged out. Switched to public view.");
  });

  // Edit Details Modal
  const editDetailsModal = document.getElementById("editDetailsModal");
  const editDetailsBtn = document.getElementById("editDetailsBtn");
  const closeEditDetails = document.getElementById("closeEditDetails");
  const cancelEditDetails = document.getElementById("cancelEditDetails");
  const editDetailsForm = document.getElementById("editDetailsForm");

  editDetailsBtn.addEventListener("click", () => {
    document.getElementById("inputFirstName").value = profileDetails.nameFirst || DEFAULT_DETAILS.nameFirst;
    document.getElementById("inputLastName").value = profileDetails.nameLast || DEFAULT_DETAILS.nameLast;
    document.getElementById("inputEyebrow").value = profileDetails.eyebrow || DEFAULT_DETAILS.eyebrow;
    document.getElementById("inputLocationUrl").value = profileDetails.locationUrl || DEFAULT_DETAILS.locationUrl;
    document.getElementById("inputRole").value = profileDetails.role || DEFAULT_DETAILS.role;
    document.getElementById("inputDesc").value = profileDetails.desc || DEFAULT_DETAILS.desc;
    document.getElementById("inputPhone").value = profileDetails.phone || DEFAULT_DETAILS.phone;
    document.getElementById("inputEmail").value = profileDetails.email || DEFAULT_DETAILS.email;
    editDetailsModal.classList.add("open");
  });

  closeEditDetails.addEventListener("click", () => editDetailsModal.classList.remove("open"));
  cancelEditDetails.addEventListener("click", () => editDetailsModal.classList.remove("open"));

  editDetailsForm.addEventListener("submit", (e) => {
    e.preventDefault();
    profileDetails = {
      nameFirst: document.getElementById("inputFirstName").value.trim(),
      nameLast: document.getElementById("inputLastName").value.trim(),
      eyebrow: document.getElementById("inputEyebrow").value.trim(),
      locationUrl: document.getElementById("inputLocationUrl").value.trim() || DEFAULT_DETAILS.locationUrl,
      role: document.getElementById("inputRole").value.trim(),
      desc: document.getElementById("inputDesc").value.trim(),
      phone: document.getElementById("inputPhone").value.trim(),
      email: document.getElementById("inputEmail").value.trim()
    };
    saveDetails();
    render();
    editDetailsModal.classList.remove("open");
    showToast("Details updated successfully!");
  });

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

  // Backdrop click to close modals
  document.querySelectorAll(".modal-backdrop").forEach(backdrop => {
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) {
        backdrop.classList.remove("open");
      }
    });
  });

  // Escape to close
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal-backdrop").forEach(b => b.classList.remove("open"));
    }
  });
}

function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.style.display = "block";
  setTimeout(() => {
    t.style.display = "none";
  }, 2400);
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
