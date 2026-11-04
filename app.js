/**
 * Suni Jose &bull; Minimal Bio-Link Web App
 */

const DEFAULT_BG = "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2000";

const DEFAULT_DETAILS = {
  name: "Suni Jose",
  role: "Assistant Professor",
  dept: "Department of Computer Science & Business Systems",
  email: "sunijose.cs@cce.edu.in",
  phone: "7994532402",
  avatar: ""
};

const DEFAULT_LINKS = [
  { id: "1", title: "KTU Student & Faculty Portal", url: "https://ktu.edu.in" },
  { id: "2", title: "CSBS Curriculum & Syllabus", url: "https://ktu.edu.in/eu/acd/academicRegulationSys.htm" },
  { id: "3", title: "Christ College of Engineering (CCE)", url: "https://cce.edu.in" },
  { id: "4", title: "IEEE Xplore Digital Library", url: "https://ieeexplore.ieee.org" },
  { id: "5", title: "NPTEL & SWAYAM Online Courses", url: "https://nptel.ac.in" }
];

let details = {};
let links = [];
let bgPhotoUrl = "";
let isEditor = false;

document.addEventListener("DOMContentLoaded", () => {
  loadData();
  setupEvents();
  render();
});

function loadData() {
  try {
    const savedBg = localStorage.getItem("suni_bg_photo");
    bgPhotoUrl = savedBg || DEFAULT_BG;

    const savedDetails = localStorage.getItem("suni_details_v3");
    details = savedDetails ? JSON.parse(savedDetails) : { ...DEFAULT_DETAILS };

    const savedLinks = localStorage.getItem("suni_links_v3");
    links = savedLinks ? JSON.parse(savedLinks) : [...DEFAULT_LINKS];

    isEditor = localStorage.getItem("suni_editor_active") === "true";
  } catch (e) {
    bgPhotoUrl = DEFAULT_BG;
    details = { ...DEFAULT_DETAILS };
    links = [...DEFAULT_LINKS];
    isEditor = false;
  }
}

function saveDetails() {
  localStorage.setItem("suni_details_v3", JSON.stringify(details));
}

function saveLinks() {
  localStorage.setItem("suni_links_v3", JSON.stringify(links));
}

function saveBg(url) {
  bgPhotoUrl = url;
  localStorage.setItem("suni_bg_photo", url);
  document.getElementById("bgPhoto").style.backgroundImage = `url('${url}')`;
}

// =============================================================================
// Rendering
// =============================================================================

function render() {
  // Background
  document.getElementById("bgPhoto").style.backgroundImage = `url('${bgPhotoUrl}')`;

  // Details
  document.getElementById("personName").textContent = details.name || "Suni Jose";
  document.getElementById("personRole").textContent = details.role || "Assistant Professor";
  document.getElementById("personDept").textContent = details.dept || "Department of CSBS";
  
  const emailEl = document.getElementById("contactEmail");
  if (details.email) {
    emailEl.href = `mailto:${details.email}`;
    document.getElementById("emailText").textContent = details.email;
    emailEl.style.display = "inline-flex";
  } else {
    emailEl.style.display = "none";
  }

  const phoneEl = document.getElementById("contactPhone");
  if (details.phone) {
    phoneEl.href = `tel:${details.phone}`;
    document.getElementById("phoneText").textContent = details.phone;
    phoneEl.style.display = "inline-flex";
  } else {
    phoneEl.style.display = "none";
  }

  // Avatar
  const avatarBox = document.getElementById("avatarContainer");
  if (details.avatar && details.avatar.trim().length > 0) {
    avatarBox.innerHTML = `<img src="${details.avatar}" alt="${details.name}" onerror="this.onerror=null; this.parentElement.textContent='SJ';" />`;
  } else {
    avatarBox.textContent = getInitials(details.name);
  }

  // Editor controls state
  const editorBar = document.getElementById("editorControls");
  const loginBtn = document.getElementById("loginBtn");
  const avatarCameraBtn = document.getElementById("changeAvatarBtn");

  if (isEditor) {
    editorBar.style.display = "flex";
    loginBtn.style.display = "none";
    avatarCameraBtn.style.display = "flex";
  } else {
    editorBar.style.display = "none";
    loginBtn.style.display = "inline-flex";
    avatarCameraBtn.style.display = "none";
  }

  // Links List
  renderLinks();
}

function renderLinks() {
  const container = document.getElementById("linksList");
  container.innerHTML = "";

  links.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "link-item";

    const domain = getDomainName(item.url);
    const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    const fullUrl = ensureUrl(item.url);

    row.innerHTML = `
      <a href="${fullUrl}" target="_blank" rel="noopener noreferrer" class="link-btn">
        <div class="link-content">
          <div class="link-favicon">
            <img src="${favicon}" alt="" onerror="this.onerror=null; this.src='https://www.google.com/s2/favicons?domain=example.com&sz=32';" />
          </div>
          <span class="link-title">${escapeHtml(item.title)}</span>
        </div>
        <div class="link-arrow">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.2" fill="none"><path d="M7 17l10-10M7 7h10v10"></path></svg>
        </div>
      </a>
      ${isEditor ? `
        <button class="delete-link-btn" title="Delete Link" data-index="${index}">
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      ` : ""}
    `;

    if (isEditor) {
      row.querySelector(".delete-link-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        if (confirm(`Remove link: "${item.title}"?`)) {
          links.splice(index, 1);
          saveLinks();
          renderLinks();
          showToast("Link removed");
        }
      });
    }

    container.appendChild(row);
  });
}

// =============================================================================
// Event Handlers
// =============================================================================

function setupEvents() {
  // Add Link Modal
  const addLinkModal = document.getElementById("addLinkModal");
  document.getElementById("openAddLinkModalBtn").addEventListener("click", () => {
    if (!isEditor) {
      openModal("loginModal");
      return;
    }
    document.getElementById("newLinkTitle").value = "";
    document.getElementById("newLinkUrl").value = "";
    openModal("addLinkModal");
    document.getElementById("newLinkTitle").focus();
  });

  document.getElementById("closeAddLinkModal").addEventListener("click", () => closeModal("addLinkModal"));
  document.getElementById("cancelAddLink").addEventListener("click", () => closeModal("addLinkModal"));

  document.getElementById("addLinkForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("newLinkTitle").value.trim();
    const url = document.getElementById("newLinkUrl").value.trim();
    if (title && url) {
      links.push({ id: Date.now().toString(), title, url });
      saveLinks();
      renderLinks();
      closeModal("addLinkModal");
      showToast("Link added successfully!");
    }
  });

  // Edit Details Modal
  const editDetailsModal = document.getElementById("editDetailsModal");
  document.getElementById("editDetailsBtn").addEventListener("click", () => {
    document.getElementById("inputName").value = details.name || "";
    document.getElementById("inputRole").value = details.role || "";
    document.getElementById("inputDept").value = details.dept || "";
    document.getElementById("inputEmail").value = details.email || "";
    document.getElementById("inputPhone").value = details.phone || "";
    openModal("editDetailsModal");
  });

  document.getElementById("closeEditDetailsModal").addEventListener("click", () => closeModal("editDetailsModal"));
  document.getElementById("cancelEditDetails").addEventListener("click", () => closeModal("editDetailsModal"));

  document.getElementById("editDetailsForm").addEventListener("submit", (e) => {
    e.preventDefault();
    details.name = document.getElementById("inputName").value.trim();
    details.role = document.getElementById("inputRole").value.trim();
    details.dept = document.getElementById("inputDept").value.trim();
    details.email = document.getElementById("inputEmail").value.trim();
    details.phone = document.getElementById("inputPhone").value.trim();
    saveDetails();
    render();
    closeModal("editDetailsModal");
    showToast("Details updated!");
  });

  // Change Background Modal
  const changeBgModal = document.getElementById("changeBgModal");
  document.getElementById("changeBgBtn").addEventListener("click", () => {
    document.getElementById("bgUrlInput").value = "";
    openModal("changeBgModal");
  });

  document.getElementById("closeBgModal").addEventListener("click", () => closeModal("changeBgModal"));
  document.getElementById("cancelBgModal").addEventListener("click", () => closeModal("changeBgModal"));

  document.getElementById("selectBgFileBtn").addEventListener("click", () => {
    document.getElementById("bgFileInput").click();
  });

  document.getElementById("bgFileInput").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        saveBg(evt.target.result);
        closeModal("changeBgModal");
        showToast("Background photo updated!");
      };
      reader.readAsDataURL(file);
    }
  });

  document.getElementById("saveBgUrlBtn").addEventListener("click", () => {
    const url = document.getElementById("bgUrlInput").value.trim();
    if (url) {
      saveBg(url);
      closeModal("changeBgModal");
      showToast("Background photo updated!");
    }
  });

  // Background presets
  document.querySelectorAll(".thumb-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const bg = btn.dataset.bg;
      if (bg) {
        saveBg(bg);
        closeModal("changeBgModal");
        showToast("Background updated!");
      }
    });
  });

  // Change Avatar photo
  const avatarInput = document.getElementById("avatarFileInput");
  document.getElementById("changeAvatarBtn").addEventListener("click", () => {
    avatarInput.click();
  });

  avatarInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        details.avatar = evt.target.result;
        saveDetails();
        render();
        showToast("Profile photo updated!");
      };
      reader.readAsDataURL(file);
    }
  });

  // Login Modal
  const loginModal = document.getElementById("loginModal");
  document.getElementById("loginBtn").addEventListener("click", () => {
    document.getElementById("loginPasscode").value = "";
    document.getElementById("loginError").style.display = "none";
    openModal("loginModal");
    setTimeout(() => document.getElementById("loginPasscode").focus(), 80);
  });

  document.getElementById("closeLoginModal").addEventListener("click", () => closeModal("loginModal"));
  document.getElementById("cancelLogin").addEventListener("click", () => closeModal("loginModal"));

  document.getElementById("loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const code = document.getElementById("loginPasscode").value;
    if (code === "admin123" || code === "admin") {
      isEditor = true;
      localStorage.setItem("suni_editor_active", "true");
      closeModal("loginModal");
      render();
      showToast("Editor mode active!");
    } else {
      document.getElementById("loginError").style.display = "block";
    }
  });

  document.getElementById("logoutBtn").addEventListener("click", () => {
    isEditor = false;
    localStorage.setItem("suni_editor_active", "false");
    render();
    showToast("Switched to public view");
  });

  // Backdrop click to close
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

function openModal(id) {
  document.getElementById(id).classList.add("open");
}

function closeModal(id) {
  document.getElementById(id).classList.remove("open");
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

function getDomainName(url) {
  try {
    return new URL(ensureUrl(url)).hostname.replace(/^www\./, "");
  } catch (e) {
    return "example.com";
  }
}

function getInitials(name) {
  if (!name) return "SJ";
  const p = name.trim().split(/\s+/);
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
}
