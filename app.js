/**
 * LinkSpace &bull; Link Organiser & Personal Dashboard
 * Pure JavaScript &bull; Zero external runtime dependencies &bull; Offline-capable
 */

// =============================================================================
// Default Seed Data - Faculty Profile & Academic Links
// =============================================================================

const DEFAULT_PERSON = {
  name: "Suni Jose",
  role: "Assistant Professor",
  dept: "Department of Computer Science and Business Systems",
  email: "sunijose.cs@cce.edu.in",
  phone: "7994532402",
  location: "Christ College of Engineering",
  avatarUrl: "",
  bio: "Assistant Professor in the Department of Computer Science and Business Systems. Curating academic resources, lecture notes, syllabus, coding labs, research repositories, and department portals.",
  socials: [
    { label: "CCE Portal", url: "https://cce.edu.in" },
    { label: "KTU Academic", url: "https://ktu.edu.in" },
    { label: "Google Scholar", url: "https://scholar.google.com" },
    { label: "LinkedIn", url: "https://linkedin.com" }
  ],
  notes: "Department of Computer Science and Business Systems &bull; Office Hours: 9:00 AM - 4:30 PM (Mon-Fri) | Contact via official email for academic & project consultations."
};

const DEFAULT_LINKS = [
  {
    id: "link-1",
    title: "KTU Student & Faculty Portal",
    url: "https://ktu.edu.in",
    category: "Academic",
    tags: ["ktu", "portal", "exams", "results"],
    notes: "Official APJ Abdul Kalam Technological University academic management portal.",
    favorite: true,
    clicks: 52,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5
  },
  {
    id: "link-2",
    title: "CSBS Curriculum & Syllabus",
    url: "https://ktu.edu.in/eu/acd/academicRegulationSys.htm",
    category: "Academic",
    tags: ["csbs", "syllabus", "scheme", "regulation"],
    notes: "Detailed syllabus, course objectives, and module division for Computer Science and Business Systems.",
    favorite: true,
    clicks: 74,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4
  },
  {
    id: "link-3",
    title: "Christ College of Engineering (CCE)",
    url: "https://cce.edu.in",
    category: "Institution",
    tags: ["cce", "college", "faculty", "announcements"],
    notes: "Official campus website, event calendar, and department announcements.",
    favorite: true,
    clicks: 48,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3
  },
  {
    id: "link-4",
    title: "NPTEL & SWAYAM Online Courses",
    url: "https://nptel.ac.in",
    category: "Learning",
    tags: ["mooc", "certifications", "csbs", "nptel"],
    notes: "Online video lectures, assignments, and certification courses for students and faculty.",
    favorite: false,
    clicks: 31,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2
  },
  {
    id: "link-5",
    title: "IEEE Xplore Digital Library",
    url: "https://ieeexplore.ieee.org",
    category: "Research",
    tags: ["ieee", "papers", "conferences", "journals"],
    notes: "Access to IEEE scientific and technical journals, conference proceedings, and standards.",
    favorite: true,
    clicks: 39,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1
  },
  {
    id: "link-6",
    title: "GitHub Classroom & Coding Labs",
    url: "https://github.com",
    category: "Labs & Code",
    tags: ["lab", "git", "assignments", "coding"],
    notes: "Lab programming assignments, code submissions, and student project repositories.",
    favorite: false,
    clicks: 26,
    createdAt: Date.now() - 1000 * 60 * 60 * 12
  }
];

// =============================================================================
// App State & Storage Keys
// =============================================================================

const STORAGE_KEYS = {
  LINKS: "linkspace_links_v2",
  PERSON: "linkspace_person_v2",
  THEME: "linkspace_theme_v1",
  VIEW: "linkspace_view_v1",
  AUTH_SESSION: "linkspace_auth_session_v1",
  AUTH_PASSWORD: "linkspace_auth_password_v1"
};

const DEFAULT_PASSWORD = "admin123";

let links = [];
let person = {};
let activeCategory = "all";
let searchQuery = "";
let sortBy = "newest";
let viewMode = "grid";
let isAuthenticated = false;

// =============================================================================
// Initialization
// =============================================================================

document.addEventListener("DOMContentLoaded", () => {
  loadData();
  initTheme();
  setupEventListeners();
  renderApp();
});

function loadData() {
  try {
    // Check v2 or upgrade from v1 if needed
    const savedPerson = localStorage.getItem(STORAGE_KEYS.PERSON) || localStorage.getItem("linkspace_person_v1");
    if (savedPerson) {
      const parsed = JSON.parse(savedPerson);
      // If previous template person was saved, upgrade to Suni Jose
      if (!parsed.name || parsed.name === "Alex Morgan") {
        person = { ...DEFAULT_PERSON };
        savePerson();
      } else {
        person = parsed;
      }
    } else {
      person = { ...DEFAULT_PERSON };
      savePerson();
    }

    const savedLinks = localStorage.getItem(STORAGE_KEYS.LINKS) || localStorage.getItem("linkspace_links_v1");
    if (savedLinks) {
      const parsedLinks = JSON.parse(savedLinks);
      // If older seed links, adopt the new faculty links
      if (parsedLinks.length > 0 && parsedLinks[0].title === "GitHub Organization & Repos") {
        links = [...DEFAULT_LINKS];
        saveLinks();
      } else {
        links = parsedLinks;
      }
    } else {
      links = [...DEFAULT_LINKS];
      saveLinks();
    }

    const savedView = localStorage.getItem(STORAGE_KEYS.VIEW);
    if (savedView) viewMode = savedView;

    // Load auth status
    const savedAuth = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
    isAuthenticated = savedAuth === "true";
  } catch (err) {
    console.error("Error reading localStorage, reverting to defaults:", err);
    links = [...DEFAULT_LINKS];
    person = { ...DEFAULT_PERSON };
    isAuthenticated = false;
  }
}

function saveLinks() {
  try {
    localStorage.setItem(STORAGE_KEYS.LINKS, JSON.stringify(links));
  } catch (e) {
    console.error("Failed to save links to storage:", e);
  }
}

function savePerson() {
  try {
    localStorage.setItem(STORAGE_KEYS.PERSON, JSON.stringify(person));
  } catch (e) {
    console.error("Failed to save person to storage:", e);
  }
}

function getStoredPassword() {
  return localStorage.getItem(STORAGE_KEYS.AUTH_PASSWORD) || DEFAULT_PASSWORD;
}

// =============================================================================
// Theme Handling
// =============================================================================

function initTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
  if (savedTheme) {
    document.documentElement.setAttribute("data-theme", savedTheme);
  } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.setAttribute("data-theme", "light");
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  const target = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", target);
  localStorage.setItem(STORAGE_KEYS.THEME, target);
}

// =============================================================================
// Auth & Permission Management
// =============================================================================

function updateAuthUI() {
  const loginBtn = document.getElementById("loginBtn");
  const loggedInDropdown = document.getElementById("loggedInDropdownContainer");
  const openAddBtn = document.getElementById("openAddModalBtn");
  const editPersonBtn = document.getElementById("editPersonBtn");
  const personLoginPrompt = document.getElementById("personLoginPromptBtn");
  const avatarUploadBtn = document.getElementById("avatarUploadBtn");

  if (isAuthenticated) {
    loginBtn.style.display = "none";
    loggedInDropdown.style.display = "block";
    openAddBtn.style.display = "inline-flex";
    editPersonBtn.style.display = "inline-flex";
    personLoginPrompt.style.display = "none";
    if (avatarUploadBtn) avatarUploadBtn.style.display = "flex";
  } else {
    loginBtn.style.display = "inline-flex";
    loggedInDropdown.style.display = "none";
    openAddBtn.style.display = "none";
    editPersonBtn.style.display = "none";
    personLoginPrompt.style.display = "inline-flex";
    if (avatarUploadBtn) avatarUploadBtn.style.display = "none";
  }
}

function openLoginModal() {
  document.getElementById("loginPassword").value = "";
  document.getElementById("loginErrorMessage").style.display = "none";
  document.getElementById("loginModalBackdrop").classList.add("open");
  setTimeout(() => document.getElementById("loginPassword").focus(), 80);
}

function closeLoginModal() {
  document.getElementById("loginModalBackdrop").classList.remove("open");
}

function handleLogin(e) {
  e.preventDefault();
  const entered = document.getElementById("loginPassword").value;
  const currentPassword = getStoredPassword();

  if (entered === currentPassword) {
    isAuthenticated = true;
    localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, "true");
    closeLoginModal();
    showToast("Editor mode unlocked! You can now edit links & details.", "success");
    renderApp();
  } else {
    document.getElementById("loginErrorMessage").style.display = "flex";
    document.getElementById("loginPassword").focus();
    document.getElementById("loginPassword").select();
  }
}

function handleLogout() {
  isAuthenticated = false;
  localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, "false");
  document.getElementById("userDropdown").classList.remove("show");
  showToast("Logged out. Switched to View-Only mode.", "info");
  renderApp();
}

function openChangePasswordModal() {
  document.getElementById("userDropdown").classList.remove("show");
  document.getElementById("changePasswordForm").reset();
  document.getElementById("changePasswordError").style.display = "none";
  document.getElementById("changePasswordModalBackdrop").classList.add("open");
  setTimeout(() => document.getElementById("currentPasswordInput").focus(), 80);
}

function closeChangePasswordModal() {
  document.getElementById("changePasswordModalBackdrop").classList.remove("open");
}

function handleChangePassword(e) {
  e.preventDefault();
  const current = document.getElementById("currentPasswordInput").value;
  const next = document.getElementById("newPasswordInput").value;
  const confirm = document.getElementById("confirmPasswordInput").value;
  const errBox = document.getElementById("changePasswordError");

  const validPassword = getStoredPassword();

  if (current !== validPassword) {
    errBox.textContent = "Current password does not match.";
    errBox.style.display = "flex";
    return;
  }

  if (next.length < 4) {
    errBox.textContent = "New password must be at least 4 characters long.";
    errBox.style.display = "flex";
    return;
  }

  if (next !== confirm) {
    errBox.textContent = "New passwords do not match.";
    errBox.style.display = "flex";
    return;
  }

  localStorage.setItem(STORAGE_KEYS.AUTH_PASSWORD, next);
  closeChangePasswordModal();
  showToast("Password updated successfully!", "success");
}

function togglePasswordVisibility() {
  const pwdInput = document.getElementById("loginPassword");
  const eyeIcon = document.getElementById("eyeIcon");
  if (pwdInput.type === "password") {
    pwdInput.type = "text";
    eyeIcon.innerHTML = `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>`;
  } else {
    pwdInput.type = "password";
    eyeIcon.innerHTML = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>`;
  }
}

// =============================================================================
// Image & Photo Upload Helper
// =============================================================================

function handleImageFileUpload(file, callback) {
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    showToast("Please choose a valid image file (JPG, PNG, WebP).", "error");
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    showToast("Image is larger than 5MB. Please choose a smaller photo.", "error");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    callback(e.target.result);
  };
  reader.readAsDataURL(file);
}

function updateModalPhotoPreview(url, name) {
  const previewBox = document.getElementById("modalPhotoPreview");
  const removeBtn = document.getElementById("removePhotoBtn");
  const fallbackInitials = getInitials(name || person.name || "Suni Jose");

  if (url && url.trim().length > 0) {
    previewBox.innerHTML = `<img src="${url}" alt="Preview" onerror="this.onerror=null; this.parentElement.textContent='${fallbackInitials}';" />`;
    if (removeBtn) removeBtn.style.display = "inline-flex";
  } else {
    previewBox.textContent = fallbackInitials;
    if (removeBtn) removeBtn.style.display = "none";
  }
}

// =============================================================================
// Render Functions
// =============================================================================

function renderApp() {
  updateAuthUI();
  renderPersonSpace();
  renderStats();
  renderCategoryTabs();
  renderLinks();
  updateViewModeToggle();
}

/** Render Person Profile Sidebar */
function renderPersonSpace() {
  document.getElementById("viewPersonName").textContent = person.name || "Suni Jose";
  document.getElementById("viewPersonRole").textContent = person.role || "Assistant Professor";
  
  const deptEl = document.getElementById("viewPersonDept");
  if (person.dept) {
    deptEl.textContent = person.dept;
    deptEl.style.display = "inline-block";
  } else {
    deptEl.style.display = "none";
  }

  document.getElementById("viewPersonBio").textContent = person.bio || "No description provided yet.";

  // Email
  const emailItem = document.getElementById("itemEmail");
  const emailLink = document.getElementById("viewPersonEmail");
  if (person.email) {
    emailLink.textContent = person.email;
    emailLink.href = `mailto:${person.email}`;
    emailItem.style.display = "flex";
  } else {
    emailItem.style.display = "none";
  }

  // Phone
  const phoneItem = document.getElementById("itemPhone");
  const phoneVal = document.getElementById("viewPersonPhone");
  if (person.phone) {
    phoneVal.textContent = person.phone;
    phoneVal.href = `tel:${person.phone}`;
    phoneItem.style.display = "flex";
  } else {
    phoneItem.style.display = "none";
  }

  // Location / Campus
  const locItem = document.getElementById("itemLocation");
  const locVal = document.getElementById("viewPersonLocation");
  if (person.location) {
    locVal.textContent = person.location;
    locItem.style.display = "flex";
  } else {
    locItem.style.display = "none";
  }

  // Avatar / Photo
  const avatarContainer = document.getElementById("personAvatarContainer");
  if (person.avatarUrl && person.avatarUrl.trim().length > 0) {
    avatarContainer.innerHTML = `<img src="${person.avatarUrl}" alt="${escapeHtml(person.name)}" onerror="this.onerror=null; this.parentElement.textContent='${getInitials(person.name)}';" />`;
  } else {
    avatarContainer.textContent = getInitials(person.name);
  }

  // Social Links
  const socialTagsContainer = document.getElementById("personSocialTags");
  socialTagsContainer.innerHTML = "";
  if (Array.isArray(person.socials) && person.socials.length > 0) {
    person.socials.forEach(item => {
      const a = document.createElement("a");
      a.className = "person-tag-link";
      a.href = ensureUrlProtocol(item.url);
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.innerHTML = `
        <span>${escapeHtml(item.label)}</span>
        <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
      `;
      socialTagsContainer.appendChild(a);
    });
  } else {
    socialTagsContainer.innerHTML = `<span class="contact-val" style="color: var(--text-muted); font-size: 0.78rem;">No profile links added yet.</span>`;
  }

  // Notes
  const notesEl = document.getElementById("viewPersonNotes");
  notesEl.innerHTML = escapeHtml(person.notes || "No shared space notes.").replace(/&bull;/g, "&bull;");
}

/** Render Header & Summary Stats */
function renderStats() {
  const total = links.length;
  const favorites = links.filter(l => l.favorite).length;
  const totalClicks = links.reduce((sum, l) => sum + (l.clicks || 0), 0);

  // Unique categories count
  const categories = new Set(links.map(l => (l.category || "General").trim().toLowerCase()));

  document.getElementById("headerTotalLinks").textContent = total;
  document.getElementById("statTotalLinks").textContent = total;
  document.getElementById("statFavorites").textContent = favorites;
  document.getElementById("statCategories").textContent = categories.size;
  document.getElementById("statTotalClicks").textContent = totalClicks;
}

/** Render Category Filter Tabs */
function renderCategoryTabs() {
  const tabsContainer = document.getElementById("categoryTabs");
  tabsContainer.innerHTML = "";

  // Compute count for "All" and "Favorites"
  const allCount = links.length;
  const favCount = links.filter(l => l.favorite).length;

  // Build category count dictionary
  const catCounts = {};
  links.forEach(l => {
    const cat = (l.category && l.category.trim()) ? l.category.trim() : "General";
    catCounts[cat] = (catCounts[cat] || 0) + 1;
  });

  // Base tabs: "All", "Favorites"
  createTabButton("all", "All Links", allCount, activeCategory === "all");
  createTabButton("favorites", "Starred", favCount, activeCategory === "favorites", true);

  // Dynamic category tabs
  Object.keys(catCounts).sort().forEach(cat => {
    createTabButton(cat, cat, catCounts[cat], activeCategory === cat);
  });

  function createTabButton(id, label, count, isActive, isStar = false) {
    const btn = document.createElement("button");
    btn.className = `tab-pill ${isActive ? "active" : ""}`;
    btn.dataset.category = id;

    let iconHtml = "";
    if (isStar) {
      iconHtml = `<svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2.2" fill="${isActive ? 'currentColor' : 'none'}"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
    }

    btn.innerHTML = `${iconHtml}<span>${escapeHtml(label)}</span><span class="tab-pill-badge">${count}</span>`;
    btn.addEventListener("click", () => {
      activeCategory = id;
      renderCategoryTabs();
      renderLinks();
    });
    tabsContainer.appendChild(btn);
  }
}

/** Filter, Sort, and Render Links */
function renderLinks() {
  const container = document.getElementById("linksGrid");
  const emptyState = document.getElementById("emptyState");

  let filtered = [...links];

  // 1. Filter by category
  if (activeCategory === "favorites") {
    filtered = filtered.filter(l => l.favorite);
  } else if (activeCategory !== "all") {
    filtered = filtered.filter(l => {
      const cat = (l.category && l.category.trim()) ? l.category.trim() : "General";
      return cat.toLowerCase() === activeCategory.toLowerCase();
    });
  }

  // 2. Filter by search query
  if (searchQuery.trim().length > 0) {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(l => {
      const inTitle = (l.title || "").toLowerCase().includes(q);
      const inUrl = (l.url || "").toLowerCase().includes(q);
      const inNotes = (l.notes || "").toLowerCase().includes(q);
      const inCategory = (l.category || "").toLowerCase().includes(q);
      const inTags = Array.isArray(l.tags) && l.tags.some(t => t.toLowerCase().includes(q));
      return inTitle || inUrl || inNotes || inCategory || inTags;
    });
  }

  // 3. Sorting
  filtered.sort((a, b) => {
    switch (sortBy) {
      case "oldest":
        return (a.createdAt || 0) - (b.createdAt || 0);
      case "alpha":
        return (a.title || "").localeCompare(b.title || "");
      case "clicks":
        return (b.clicks || 0) - (a.clicks || 0);
      case "starred":
        if (a.favorite === b.favorite) {
          return (b.createdAt || 0) - (a.createdAt || 0);
        }
        return a.favorite ? -1 : 1;
      case "newest":
      default:
        return (b.createdAt || 0) - (a.createdAt || 0);
    }
  });

  // Render or Empty State
  if (filtered.length === 0) {
    container.innerHTML = "";
    emptyState.style.display = "flex";
    return;
  }

  emptyState.style.display = "none";
  container.innerHTML = "";

  filtered.forEach(link => {
    const card = createLinkCardElement(link);
    container.appendChild(card);
  });
}

/** Construct DOM for a single link card */
function createLinkCardElement(link) {
  const card = document.createElement("article");
  card.className = `link-card ${link.favorite ? "starred" : ""}`;
  card.id = `link-card-${link.id}`;

  const cleanDomain = getDomainName(link.url);
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=64`;
  const initialLetter = (link.title || "L").charAt(0).toUpperCase();

  const formattedUrl = ensureUrlProtocol(link.url);

  // Category & tags html
  const categoryBadge = link.category 
    ? `<span class="category-tag">${escapeHtml(link.category)}</span>` 
    : `<span class="category-tag">General</span>`;

  let tagsHtml = "";
  if (Array.isArray(link.tags) && link.tags.length > 0) {
    tagsHtml = link.tags.map(t => `<span class="regular-tag">#${escapeHtml(t)}</span>`).join(" ");
  }

  // Quick Action Buttons depending on Editor auth status
  let actionButtonsHtml = "";
  if (isAuthenticated) {
    actionButtonsHtml = `
      <button class="icon-btn-ghost star-btn ${link.favorite ? "active" : ""}" title="${link.favorite ? "Unstar" : "Star as favorite"}" data-action="toggle-star">
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
      </button>
      <button class="icon-btn-ghost" title="Edit Link" data-action="edit">
        <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
      </button>
      <button class="icon-btn-ghost delete-btn" title="Delete Link" data-action="delete">
        <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
      </button>
    `;
  } else if (link.favorite) {
    actionButtonsHtml = `
      <span class="icon-btn-ghost star-btn active" style="cursor: default;" title="Starred Favorite">
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
      </span>
    `;
  }

  card.innerHTML = `
    <div class="card-top">
      <div class="link-favicon" title="${escapeHtml(cleanDomain)}">
        <img src="${faviconUrl}" alt="" onerror="this.onerror=null; this.parentElement.textContent='${initialLetter}';" />
      </div>
      <div class="card-title-wrap">
        <h4 class="link-title" title="${escapeHtml(link.title)}">${escapeHtml(link.title)}</h4>
        <span class="link-url-sub" title="${escapeHtml(link.url)}">${escapeHtml(cleanDomain)}</span>
      </div>
      <div class="card-actions-quick">
        ${actionButtonsHtml}
      </div>
    </div>

    <div class="card-content">
      ${link.notes ? `<p class="link-notes">${escapeHtml(link.notes)}</p>` : ""}
      <div class="tags-row">
        ${categoryBadge}
        ${tagsHtml}
      </div>
    </div>

    <div class="card-footer">
      <div class="card-visit-stat" title="Total clicks">
        <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
        <span>${link.clicks || 0} visits</span>
      </div>

      <div class="card-primary-actions">
        <button class="copy-link-btn" data-action="copy" title="Copy URL to clipboard">
          <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          Copy
        </button>
        <a href="${formattedUrl}" target="_blank" rel="noopener noreferrer" class="open-link-btn" data-action="open">
          Open
          <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2.2" fill="none"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
        </a>
      </div>
    </div>
  `;

  // Attach card event listeners if editor buttons exist
  const starBtn = card.querySelector('[data-action="toggle-star"]');
  if (starBtn) {
    starBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleStarLink(link.id);
    });
  }

  const editBtn = card.querySelector('[data-action="edit"]');
  if (editBtn) {
    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openEditLinkModal(link.id);
    });
  }

  const delBtn = card.querySelector('[data-action="delete"]');
  if (delBtn) {
    delBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteLink(link.id);
    });
  }

  card.querySelector('[data-action="copy"]').addEventListener("click", (e) => {
    e.stopPropagation();
    copyToClipboard(formattedUrl);
  });

  card.querySelector('[data-action="open"]').addEventListener("click", () => {
    incrementLinkClicks(link.id);
  });

  return card;
}

function updateViewModeToggle() {
  const grid = document.getElementById("linksGrid");
  const gridBtn = document.getElementById("viewGridBtn");
  const listBtn = document.getElementById("viewListBtn");

  if (viewMode === "list") {
    grid.classList.add("view-list");
    listBtn.classList.add("active");
    gridBtn.classList.remove("active");
  } else {
    grid.classList.remove("view-list");
    gridBtn.classList.add("active");
    listBtn.classList.remove("active");
  }
}

// =============================================================================
// Link Actions & Operations
// =============================================================================

function toggleStarLink(id) {
  if (!isAuthenticated) {
    openLoginModal();
    return;
  }
  const index = links.findIndex(l => l.id === id);
  if (index !== -1) {
    links[index].favorite = !links[index].favorite;
    saveLinks();
    renderStats();
    renderCategoryTabs();
    renderLinks();
    showToast(links[index].favorite ? "Link starred as favorite!" : "Removed from favorites", "info");
  }
}

function incrementLinkClicks(id) {
  const index = links.findIndex(l => l.id === id);
  if (index !== -1) {
    links[index].clicks = (links[index].clicks || 0) + 1;
    saveLinks();
    renderStats();
  }
}

function deleteLink(id) {
  if (!isAuthenticated) {
    openLoginModal();
    return;
  }
  const link = links.find(l => l.id === id);
  if (!link) return;

  if (confirm(`Are you sure you want to delete "${link.title}"?`)) {
    links = links.filter(l => l.id !== id);
    saveLinks();
    renderApp();
    showToast("Link deleted successfully.", "error");
  }
}

function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast("Link copied to clipboard!", "success");
    }).catch(() => {
      fallbackCopy(text);
    });
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try {
    document.execCommand("copy");
    showToast("Link copied to clipboard!", "success");
  } catch (err) {
    showToast("Could not copy link automatically.", "error");
  }
  document.body.removeChild(ta);
}

// =============================================================================
// Modal Management
// =============================================================================

// Link Modal
function openAddLinkModal() {
  if (!isAuthenticated) {
    showToast("Please log in as Editor to add new links.", "info");
    openLoginModal();
    return;
  }

  document.getElementById("linkModalTitle").textContent = "Add New Link";
  document.getElementById("linkForm").reset();
  document.getElementById("linkId").value = "";
  document.getElementById("linkFavorite").checked = false;

  // Pre-fill category if a specific category tab is active
  if (activeCategory !== "all" && activeCategory !== "favorites") {
    document.getElementById("linkCategory").value = activeCategory;
  }

  const modal = document.getElementById("linkModalBackdrop");
  modal.classList.add("open");
  document.getElementById("linkUrl").focus();
}

function openEditLinkModal(id) {
  if (!isAuthenticated) {
    openLoginModal();
    return;
  }

  const link = links.find(l => l.id === id);
  if (!link) return;

  document.getElementById("linkModalTitle").textContent = "Edit Link Details";
  document.getElementById("linkId").value = link.id;
  document.getElementById("linkUrl").value = link.url || "";
  document.getElementById("linkTitle").value = link.title || "";
  document.getElementById("linkCategory").value = link.category || "";
  document.getElementById("linkTags").value = Array.isArray(link.tags) ? link.tags.join(", ") : "";
  document.getElementById("linkNotes").value = link.notes || "";
  document.getElementById("linkFavorite").checked = !!link.favorite;

  const modal = document.getElementById("linkModalBackdrop");
  modal.classList.add("open");
  document.getElementById("linkTitle").focus();
}

function closeLinkModal() {
  document.getElementById("linkModalBackdrop").classList.remove("open");
}

function handleSaveLink(e) {
  e.preventDefault();

  if (!isAuthenticated) {
    openLoginModal();
    return;
  }

  const id = document.getElementById("linkId").value;
  const rawUrl = document.getElementById("linkUrl").value.trim();
  const title = document.getElementById("linkTitle").value.trim();
  const category = document.getElementById("linkCategory").value.trim() || "General";
  const tagsStr = document.getElementById("linkTags").value.trim();
  const notes = document.getElementById("linkNotes").value.trim();
  const favorite = document.getElementById("linkFavorite").checked;

  if (!rawUrl || !title) {
    showToast("Please provide both a URL and a Title.", "error");
    return;
  }

  const tags = tagsStr
    ? tagsStr.split(",").map(t => t.trim().replace(/^#/, "")).filter(t => t.length > 0)
    : [];

  if (id) {
    // Edit existing
    const index = links.findIndex(l => l.id === id);
    if (index !== -1) {
      links[index] = {
        ...links[index],
        url: rawUrl,
        title,
        category,
        tags,
        notes,
        favorite
      };
      showToast("Link updated successfully!", "success");
    }
  } else {
    // Add new
    const newLink = {
      id: "link-" + Date.now(),
      url: rawUrl,
      title,
      category,
      tags,
      notes,
      favorite,
      clicks: 0,
      createdAt: Date.now()
    };
    links.unshift(newLink);
    showToast("Link added to dashboard!", "success");
  }

  saveLinks();
  closeLinkModal();
  renderApp();
}

// Person Modal
function openEditPersonModal() {
  if (!isAuthenticated) {
    showToast("Please log in as Editor to edit personal details.", "info");
    openLoginModal();
    return;
  }

  document.getElementById("personNameInput").value = person.name || "";
  document.getElementById("personRoleInput").value = person.role || "";
  document.getElementById("personDeptInput").value = person.dept || "";
  document.getElementById("personLocationInput").value = person.location || "";
  document.getElementById("personEmailInput").value = person.email || "";
  document.getElementById("personPhoneInput").value = person.phone || "";
  document.getElementById("personAvatarUrlInput").value = person.avatarUrl || "";
  document.getElementById("personBioInput").value = person.bio || "";
  document.getElementById("personNotesInput").value = person.notes || "";

  updateModalPhotoPreview(person.avatarUrl, person.name);

  // Convert socials array to multiline string: "Label: URL"
  const socialsStr = Array.isArray(person.socials)
    ? person.socials.map(s => `${s.label}: ${s.url}`).join("\n")
    : "";
  document.getElementById("personSocialsInput").value = socialsStr;

  document.getElementById("personModalBackdrop").classList.add("open");
  document.getElementById("personNameInput").focus();
}

function closePersonModal() {
  document.getElementById("personModalBackdrop").classList.remove("open");
}

function handleSavePerson(e) {
  e.preventDefault();

  if (!isAuthenticated) {
    openLoginModal();
    return;
  }

  const name = document.getElementById("personNameInput").value.trim();
  if (!name) {
    showToast("Full Name is required.", "error");
    return;
  }

  // Parse socials
  const rawSocials = document.getElementById("personSocialsInput").value.trim();
  const parsedSocials = [];
  if (rawSocials) {
    rawSocials.split("\n").forEach(line => {
      const parts = line.split(":");
      if (parts.length >= 2) {
        const label = parts[0].trim();
        const url = parts.slice(1).join(":").trim();
        if (label && url) {
          parsedSocials.push({ label, url });
        }
      }
    });
  }

  person = {
    name,
    role: document.getElementById("personRoleInput").value.trim(),
    dept: document.getElementById("personDeptInput").value.trim(),
    location: document.getElementById("personLocationInput").value.trim(),
    email: document.getElementById("personEmailInput").value.trim(),
    phone: document.getElementById("personPhoneInput").value.trim(),
    avatarUrl: document.getElementById("personAvatarUrlInput").value.trim(),
    bio: document.getElementById("personBioInput").value.trim(),
    socials: parsedSocials,
    notes: document.getElementById("personNotesInput").value.trim()
  };

  savePerson();
  closePersonModal();
  renderPersonSpace();
  showToast("Person details updated successfully!", "success");
}

// =============================================================================
// Export / Import / Reset Data
// =============================================================================

function exportData() {
  const exportPayload = {
    exportedAt: new Date().toISOString(),
    version: "2.0",
    person,
    links
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
  const dlAnchor = document.createElement("a");
  dlAnchor.setAttribute("href", dataStr);
  dlAnchor.setAttribute("download", `linkspace_${person.name.toLowerCase().replace(/\s+/g, '_')}_backup.json`);
  document.body.appendChild(dlAnchor);
  dlAnchor.click();
  dlAnchor.remove();

  showToast("Backup file downloaded successfully!", "success");
}

function handleImportFile(event) {
  if (!isAuthenticated) {
    showToast("Please log in as Editor to import data backups.", "error");
    openLoginModal();
    event.target.value = "";
    return;
  }

  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (data && (Array.isArray(data.links) || data.person)) {
        if (Array.isArray(data.links)) {
          links = data.links;
          saveLinks();
        }
        if (data.person) {
          person = data.person;
          savePerson();
        }
        renderApp();
        showToast("Data imported successfully!", "success");
      } else {
        showToast("Invalid JSON file structure.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error reading JSON file.", "error");
    }
    event.target.value = "";
  };
  reader.readAsText(file);
}

function resetToDefaultData() {
  if (!isAuthenticated) {
    showToast("Please log in as Editor to reset data.", "error");
    openLoginModal();
    return;
  }

  if (confirm("Reset everything to Suni Jose's faculty profile & default department links?")) {
    links = JSON.parse(JSON.stringify(DEFAULT_LINKS));
    person = JSON.parse(JSON.stringify(DEFAULT_PERSON));
    saveLinks();
    savePerson();
    activeCategory = "all";
    searchQuery = "";
    document.getElementById("searchInput").value = "";
    document.getElementById("clearSearchBtn").style.display = "none";
    renderApp();
    showToast("Restored to Suni Jose's faculty data.", "info");
  }
}

// =============================================================================
// Toast Notifications
// =============================================================================

function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  let icon = "";
  if (type === "success") {
    icon = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="var(--accent-emerald)" stroke-width="2.5" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  } else if (type === "error") {
    icon = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="var(--accent-rose)" stroke-width="2.5" fill="none"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
  } else {
    icon = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="var(--primary)" stroke-width="2.5" fill="none"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
  }

  toast.innerHTML = `${icon}<span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 2600);
}

// =============================================================================
// Helper Utilities
// =============================================================================

function ensureUrlProtocol(url) {
  if (!url) return "";
  let trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    return "https://" + trimmed;
  }
  return trimmed;
}

function getDomainName(url) {
  if (!url) return "link";
  try {
    const withProto = ensureUrlProtocol(url);
    const parsed = new URL(withProto);
    return parsed.hostname.replace(/^www\./, "");
  } catch (e) {
    return url;
  }
}

function getInitials(name) {
  if (!name) return "SJ";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
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

// =============================================================================
// Event Listeners Setup
// =============================================================================

function setupEventListeners() {
  // Theme Toggle
  document.getElementById("themeToggleBtn").addEventListener("click", toggleTheme);

  // Data Dropdown Menu
  const dataMenuBtn = document.getElementById("dataMenuBtn");
  const dataDropdown = document.getElementById("dataDropdown");
  dataMenuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    dataDropdown.classList.toggle("show");
    document.getElementById("userDropdown").classList.remove("show");
  });

  // User Dropdown Menu (Logged in)
  const userMenuBtn = document.getElementById("userMenuBtn");
  const userDropdown = document.getElementById("userDropdown");
  userMenuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    userDropdown.classList.toggle("show");
    dataDropdown.classList.remove("show");
  });

  document.addEventListener("click", () => {
    dataDropdown.classList.remove("show");
    userDropdown.classList.remove("show");
  });

  // Auth / Login Modal Listeners
  document.getElementById("loginBtn").addEventListener("click", openLoginModal);
  document.getElementById("personLoginPromptBtn").addEventListener("click", openLoginModal);
  document.getElementById("closeLoginModalBtn").addEventListener("click", closeLoginModal);
  document.getElementById("cancelLoginBtn").addEventListener("click", closeLoginModal);
  document.getElementById("loginForm").addEventListener("submit", handleLogin);
  document.getElementById("logoutBtn").addEventListener("click", handleLogout);
  document.getElementById("togglePasswordVisibilityBtn").addEventListener("click", togglePasswordVisibility);

  // Change Password Modal Listeners
  document.getElementById("changePasswordBtn").addEventListener("click", openChangePasswordModal);
  document.getElementById("closeChangePasswordModalBtn").addEventListener("click", closeChangePasswordModal);
  document.getElementById("cancelChangePasswordBtn").addEventListener("click", closeChangePasswordModal);
  document.getElementById("changePasswordForm").addEventListener("submit", handleChangePassword);

  // Photo Upload & Preview Listeners
  const choosePhotoFileBtn = document.getElementById("choosePhotoFileBtn");
  const modalPhotoFileInput = document.getElementById("modalPhotoFileInput");
  const removePhotoBtn = document.getElementById("removePhotoBtn");
  const personAvatarUrlInput = document.getElementById("personAvatarUrlInput");
  const avatarUploadBtn = document.getElementById("avatarUploadBtn");
  const quickAvatarFileInput = document.getElementById("quickAvatarFileInput");

  if (choosePhotoFileBtn && modalPhotoFileInput) {
    choosePhotoFileBtn.addEventListener("click", () => modalPhotoFileInput.click());
    modalPhotoFileInput.addEventListener("change", (e) => {
      handleImageFileUpload(e.target.files[0], (dataUrl) => {
        personAvatarUrlInput.value = dataUrl;
        updateModalPhotoPreview(dataUrl, document.getElementById("personNameInput").value);
        showToast("Photo loaded! Click Save to apply.", "info");
      });
      e.target.value = "";
    });
  }

  if (removePhotoBtn) {
    removePhotoBtn.addEventListener("click", () => {
      personAvatarUrlInput.value = "";
      updateModalPhotoPreview("", document.getElementById("personNameInput").value);
      showToast("Photo removed. Initials will be used.", "info");
    });
  }

  if (personAvatarUrlInput) {
    personAvatarUrlInput.addEventListener("input", (e) => {
      updateModalPhotoPreview(e.target.value, document.getElementById("personNameInput").value);
    });
  }

  // Quick avatar camera button on sidebar
  if (avatarUploadBtn && quickAvatarFileInput) {
    avatarUploadBtn.addEventListener("click", () => {
      quickAvatarFileInput.click();
    });
    quickAvatarFileInput.addEventListener("change", (e) => {
      handleImageFileUpload(e.target.files[0], (dataUrl) => {
        person.avatarUrl = dataUrl;
        savePerson();
        renderPersonSpace();
        showToast("Profile photo updated successfully!", "success");
      });
      e.target.value = "";
    });
  }

  // Export / Import / Reset
  document.getElementById("exportDataBtn").addEventListener("click", exportData);
  document.getElementById("importFileInput").addEventListener("change", handleImportFile);
  document.getElementById("resetDataBtn").addEventListener("click", resetToDefaultData);

  // Add Link Modal
  document.getElementById("openAddModalBtn").addEventListener("click", openAddLinkModal);
  document.getElementById("emptyAddBtn").addEventListener("click", openAddLinkModal);
  document.getElementById("closeLinkModalBtn").addEventListener("click", closeLinkModal);
  document.getElementById("cancelLinkBtn").addEventListener("click", closeLinkModal);
  document.getElementById("linkForm").addEventListener("submit", handleSaveLink);

  // Edit Person Modal
  document.getElementById("editPersonBtn").addEventListener("click", openEditPersonModal);
  document.getElementById("closePersonModalBtn").addEventListener("click", closePersonModal);
  document.getElementById("cancelPersonBtn").addEventListener("click", closePersonModal);
  document.getElementById("personForm").addEventListener("submit", handleSavePerson);

  // Close modals on backdrop click
  document.getElementById("linkModalBackdrop").addEventListener("click", (e) => {
    if (e.target.id === "linkModalBackdrop") closeLinkModal();
  });
  document.getElementById("personModalBackdrop").addEventListener("click", (e) => {
    if (e.target.id === "personModalBackdrop") closePersonModal();
  });
  document.getElementById("loginModalBackdrop").addEventListener("click", (e) => {
    if (e.target.id === "loginModalBackdrop") closeLoginModal();
  });
  document.getElementById("changePasswordModalBackdrop").addEventListener("click", (e) => {
    if (e.target.id === "changePasswordModalBackdrop") closeChangePasswordModal();
  });

  // Escape key closes modals & menus
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeLinkModal();
      closePersonModal();
      closeLoginModal();
      closeChangePasswordModal();
      dataDropdown.classList.remove("show");
      userDropdown.classList.remove("show");
    }
  });

  // Search Input
  const searchInput = document.getElementById("searchInput");
  const clearSearchBtn = document.getElementById("clearSearchBtn");

  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    clearSearchBtn.style.display = searchQuery ? "block" : "none";
    renderLinks();
  });

  clearSearchBtn.addEventListener("click", () => {
    searchInput.value = "";
    searchQuery = "";
    clearSearchBtn.style.display = "none";
    renderLinks();
    searchInput.focus();
  });

  // Sort Select
  const sortSelect = document.getElementById("sortBySelect");
  sortSelect.addEventListener("change", (e) => {
    sortBy = e.target.value;
    renderLinks();
  });

  // View Mode Toggles (Grid vs List)
  const gridBtn = document.getElementById("viewGridBtn");
  const listBtn = document.getElementById("viewListBtn");

  gridBtn.addEventListener("click", () => {
    viewMode = "grid";
    localStorage.setItem(STORAGE_KEYS.VIEW, "grid");
    updateViewModeToggle();
  });

  listBtn.addEventListener("click", () => {
    viewMode = "list";
    localStorage.setItem(STORAGE_KEYS.VIEW, "list");
    updateViewModeToggle();
  });

  // Quick stat filter cards (Total, Favorites)
  document.querySelectorAll(".stat-card[data-filter]").forEach(card => {
    card.addEventListener("click", () => {
      const filterType = card.dataset.filter;
      activeCategory = filterType;
      renderCategoryTabs();
      renderLinks();
    });
  });
}
